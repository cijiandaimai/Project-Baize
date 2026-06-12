"""屏幕感知分析引擎 - 后台线程，定时截图 + OCR + 知识提取"""
import os
import re
import time
import json
import base64
import logging
import hashlib
import threading
from datetime import datetime

import requests

from PyQt5.QtCore import QThread, QTimer
from PyQt5.QtGui import QScreen, QImage
from PyQt5.QtWidgets import QApplication

logger = logging.getLogger("baize.analyzer")


class ScreenAnalyzer(QThread):
    """后台屏幕分析线程

    工作流程：截图 → OCR 提取文字 → 过滤有效词汇 → 生成知识卡片 → 回调弹出气泡
    """

    def __init__(self, parent=None, config=None, database=None, on_bubble=None):
        super().__init__()
        self.parent_window = parent
        self.config = config or {}
        self.db = database
        self.on_bubble = on_bubble

        self._paused = config.get("paused", False) if config else False
        self._running = False
        self._capture_interval = config.get("capture_interval", 3) if config else 3
        self._last_capture_time = 0
        self._last_hash = None
        self._lock = threading.Lock()

        # API 配置
        self._ocr_key = self.config.get("baidu_ocr_api_key", "")
        self._ocr_secret = self.config.get("baidu_ocr_secret_key", "")
        self._qwen_key = self.config.get("qwen_vl_api_key", "")

        # 数据目录
        self._data_dir = os.path.join(os.path.expanduser("~"), ".baize_ai")
        os.makedirs(self._data_dir, exist_ok=True)

        # 内置常见英文词库（MVP 用，无需 API 也能工作）
        self._known_words = self._build_known_words()
        self._basic_dict = self._build_basic_dict()

    # ── 生命周期 ──

    def run(self):
        self._running = True
        logger.info("ScreenAnalyzer started, interval=%ds", self._capture_interval)

        while self._running:
            try:
                if not self._paused:
                    now = time.time()
                    if now - self._last_capture_time >= self._capture_interval:
                        self._do_analysis_cycle()
                        self._last_capture_time = now
            except Exception as e:
                logger.error("Analysis cycle error: %s", e)

            # 分段 sleep，方便快速响应 stop
            for _ in range(int(self._capture_interval * 10)):
                if not self._running:
                    break
                self.msleep(100)

        logger.info("ScreenAnalyzer stopped")

    def pause(self):
        self._paused = True
        logger.info("ScreenAnalyzer paused")

    def resume(self):
        self._paused = False
        self._last_capture_time = 0  # 立即触发下一次
        logger.info("ScreenAnalyzer resumed")

    def stop(self):
        self._running = False
        self.wait(3000)

    def update_config(self, config: dict):
        with self._lock:
            self.config = config
            self._capture_interval = config.get("capture_interval", 3)
            self._ocr_key = config.get("baidu_ocr_api_key", "")
            self._ocr_secret = config.get("baidu_ocr_secret_key", "")
            self._qwen_key = config.get("qwen_vl_api_key", "")

    # ── 核心分析流程 ──

    def _do_analysis_cycle(self):
        """单次分析周期"""
        image = self._capture_screen()
        if image is None:
            return

        # 去重：画面没变就跳过
        img_hash = self._hash_image(image)
        if img_hash == self._last_hash:
            return
        self._last_hash = img_hash

        # OCR 提取文字
        words = self._extract_words(image)
        if not words:
            return

        # 过滤并生成知识卡片
        new_words = self._process_words(words)
        if new_words:
            for i, item in enumerate(new_words):
                if self.on_bubble:
                    self.on_bubble(
                        item["word"], item.get("translation", ""),
                        item.get("example", ""), item.get("category", "general")
                    )
                    if i < len(new_words) - 1:
                        self.msleep(1500)  # 气泡间隔

    # ── 截图 ──

    def _capture_screen(self):
        """使用 Qt 原生截图（最稳定，无需额外依赖）"""
        try:
            app = QApplication.instance()
            screen = app.primaryScreen()
            if screen:
                pixmap = screen.grabWindow(0)
                return pixmap.toImage()
        except Exception as e:
            logger.error("Qt capture failed: %s", e)

        # 降级：使用 pyautogui
        try:
            import pyautogui
            img = pyautogui.screenshot()
            from PIL import Image
            if isinstance(img, Image.Image):
                qimg = QImage(img.tobytes(), img.width, img.height,
                              img.width * 3, QImage.Format_RGB888)
                return qimg
        except Exception as e:
            logger.error("pyautogui capture failed: %s", e)

        return None

    def _hash_image(self, image) -> str:
        """生成图像缩略图哈希，用于去重"""
        try:
            small = image.scaled(64, 64)
            ptr = small.constBits()
            data = bytes(ptr.asstring(small.byteCount()))
            return hashlib.md5(data).hexdigest()
        except Exception:
            return str(time.time())

    # ── OCR ──

    def _extract_words(self, image) -> list:
        """从屏幕截图提取英文单词"""
        # 优先使用百度 OCR API
        if self._ocr_key and self._ocr_secret:
            words = self._ocr_baidu(image)
            if words:
                return words

        # 降级：本地正则提取（从 QImage 无法直接 OCR，
        # 但在有 API 之前可以先用空结果，靠多模态兜底）
        if self._qwen_key:
            words = self._analyze_with_qwen(image)
            if words:
                return words

        # 无 API 时，使用内置基础词库进行模拟演示
        # 实际部署时应该提示用户配置 API
        return []

    def _ocr_baidu(self, image) -> list:
        """百度 OCR API 识别"""
        try:
            # 获取 access_token
            token_url = (
                "https://aip.baidubce.com/oauth/2.0/token?"
                f"grant_type=client_credentials"
                f"&client_id={self._ocr_key}"
                f"&client_secret={self._ocr_secret}"
            )
            resp = requests.get(token_url, timeout=5)
            token = resp.json().get("access_token")
            if not token:
                logger.warning("Baidu OCR token failed")
                return []

            # 图片转 base64
            b64 = self._image_to_base64(image)
            if not b64:
                return []

            # 调用 OCR
            ocr_url = (
                "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic"
                f"?access_token={token}"
            )
            resp = requests.post(
                ocr_url,
                data={"image": b64, "language_type": "ENG"},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=10
            )
            result = resp.json()
            words = []
            for item in result.get("words_result", []):
                text = item.get("words", "")
                # 提取英文单词
                found = re.findall(r'[A-Za-z]{3,}', text)
                words.extend(found)
            return words

        except Exception as e:
            logger.error("Baidu OCR error: %s", e)
            return []

    def _analyze_with_qwen(self, image) -> list:
        """通义千问 VL 多模态分析（识别屏幕内容 + 提取知识点）"""
        try:
            b64 = self._image_to_base64(image)
            if not b64:
                return []

            resp = requests.post(
                "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self._qwen_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "qwen-vl-max",
                    "messages": [{
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{b64}"
                                }
                            },
                            {
                                "type": "text",
                                "text": (
                                    "你是一个学习助手。请分析这个屏幕截图中的内容，"
                                    "提取其中可以作为知识点的英文单词或术语。\n"
                                    "请以JSON数组格式返回，每个元素包含:\n"
                                    '{"word": "单词", "translation": "中文释义", '
                                    '"category": "english/math/physics/chemistry/'
                                    'history/geography/computer/general", '
                                    '"example": "例句"}\n'
                                    "最多返回5个最重要的知识点。只返回JSON，不要其他文字。"
                                )
                            }
                        ]
                    }]
                },
                timeout=15
            )
            result = resp.json()
            content = result["choices"][0]["message"]["content"]
            # 解析 JSON
            content = content.strip()
            if content.startswith("```"):
                content = re.sub(r'^```\w*\n?', '', content)
                content = re.sub(r'\n?```$', '', content)
            items = json.loads(content)
            return items if isinstance(items, list) else []

        except Exception as e:
            logger.error("Qwen VL analysis error: %s", e)
            return []

    # ── 词汇处理 ──

    def _process_words(self, raw_words: list) -> list:
        """处理原始词汇列表：去重、过滤、分类、生成卡片"""
        if not self.db:
            return []

        seen = set()
        result = []
        max_items = self.config.get("max_words_per_capture", 5)
        min_len = self.config.get("min_word_length", 4)

        for word in raw_words:
            if not isinstance(word, str):
                # 如果已经是结构化数据（来自多模态分析）
                if isinstance(word, dict) and "word" in word:
                    w = word["word"].strip()
                    if w.lower() in seen:
                        continue
                    seen.add(w.lower())

                    # 检查是否已学过
                    already = any(
                        ew.get("word", "").lower() == w.lower()
                        for ew in self.db.words
                    )
                    if already:
                        continue

                    # 存入数据库
                    self.db.add_word(
                        w,
                        translation=word.get("translation", ""),
                        category=word.get("category", "general"),
                        example=word.get("example", ""),
                    )
                    result.append(word)
                    if len(result) >= max_items:
                        break
                continue

            w = word.strip()
            if not w or len(w) < min_len or not w.isalpha():
                continue

            w_lower = w.lower()
            if w_lower in seen:
                continue
            seen.add(w_lower)

            # 过滤常见停用词
            if w_lower in self._known_words:
                continue

            # 检查是否已学过
            already = any(
                ew.get("word", "").lower() == w_lower
                for ew in self.db.words
            )
            if already:
                continue

            # 分类
            category = self._categorize_word(w_lower)
            translation = self._basic_dict.get(w_lower, "")
            example = self._generate_example(w_lower, category)

            self.db.add_word(w, translation, category, example)
            result.append({
                "word": w,
                "translation": translation,
                "category": category,
                "example": example,
            })
            if len(result) >= max_items:
                break

        # 记录学习
        if result:
            self.db.record_study_session(len(result))

        return result

    def _categorize_word(self, word: str) -> str:
        """简单分类"""
        categories = {
            "math": {"algorithm", "equation", "function", "variable", "theorem",
                     "geometry", "algebra", "calculus", "probability", "statistics",
                     "matrix", "vector", "derivative", "integral", "formula",
                     "coefficient", "polynomial", "fraction", "decimal"},
            "physics": {"velocity", "acceleration", "gravity", "force", "energy",
                        "momentum", "friction", "wavelength", "frequency", "amplitude",
                        "electricity", "magnetic", "optics", "quantum", "relativity",
                        "thermodynamics", "entropy", "photon"},
            "chemistry": {"molecule", "element", "compound", "reaction", "oxidation",
                          "reduction", "acid", "base", "catalyst", "polymer",
                          "electron", "proton", "neutron", "isotope", "bond"},
            "computer": {"variable", "function", "class", "object", "method",
                         "array", "string", "integer", "boolean", "loop",
                         "recursion", "database", "server", "client", "protocol",
                         "compiler", "algorithm", "debugging", "interface",
                         "python", "javascript", "html", "css", "api"},
            "history": {"dynasty", "empire", "revolution", "ancient", "medieval",
                        "renaissance", "colonial", "independence", "treaty",
                        "civilization", "pharaoh", "emperor", "senate"},
            "geography": {"continent", "ocean", "climate", "terrain", "latitude",
                          "longitude", "peninsula", "archipelago", "equator",
                          "tropic", "hemisphere", "glacier", "volcano"},
        }
        for cat, terms in categories.items():
            if word in terms:
                return cat
        return "english"

    def _generate_example(self, word: str, category: str) -> str:
        """生成例句"""
        examples = {
            "math": f"The {word} is fundamental to solving this problem.",
            "physics": f"We observed the effect of {word} in the experiment.",
            "chemistry": f"The {word} played a key role in the reaction.",
            "computer": f"Let's use {word} to implement this feature.",
            "history": f"The {word} changed the course of history.",
            "geography": f"The {word} affects the climate of this region.",
        }
        return examples.get(category, f"I learned a new word: {word}!")

    # ── 工具方法 ──

    def _image_to_base64(self, image) -> str:
        """QImage 转 base64 JPEG"""
        try:
            from PyQt5.QtCore import QBuffer, QIODevice
            buffer = QBuffer()
            buffer.open(QIODevice.ReadWrite)
            image.save(buffer, "JPEG", 70)
            data = buffer.data()
            buffer.close()
            return base64.b64encode(data.data()).decode("utf-8")
        except Exception as e:
            logger.error("Image to base64 failed: %s", e)
            return ""

    # ── 内置词库 ──

    def _build_known_words(self) -> set:
        """常见英文停用词/高频无意义词，需要过滤"""
        return {
            "the", "and", "for", "are", "but", "not", "you", "all",
            "can", "had", "her", "was", "one", "our", "out", "has",
            "have", "been", "some", "them", "than", "its", "over",
            "also", "that", "with", "this", "from", "they", "were",
            "will", "each", "make", "like", "just", "know", "take",
            "come", "could", "would", "which", "their", "there",
            "about", "when", "what", "your", "will", "other",
            "into", "more", "very", "after", "still", "should",
            "because", "while", "where", "being", "through", "those",
            "since", "might", "before", "again", "against", "during",
            "never", "under", "does", "done", "going", "look",
            "right", "here", "every", "begin", "start", "click",
            "open", "close", "file", "edit", "view", "help", "menu",
            "new", "save", "copy", "paste", "undo", "redo", "search",
            "next", "back", "home", "page", "site", "app", "icon",
            "button", "window", "panel", "text", "font", "size",
            "color", "name", "type", "value", "true", "false",
            "null", "void", "main", "class", "return", "import",
            "from", "using", "public", "private", "static", "final",
            "http", "https", "www", "com", "org", "net", "html",
            "css", "xml", "json", "png", "jpg", "gif", "svg",
        }

    def _build_basic_dict(self) -> dict:
        """基础英汉词典（MVP 用，常见游戏/科技/学术词汇）"""
        return {
            # 游戏常用
            "health": "生命值", "damage": "伤害", "defense": "防御",
            "attack": "攻击", "armor": "护甲", "weapon": "武器",
            "shield": "盾牌", "magic": "魔法", "skill": "技能",
            "quest": "任务", "reward": "奖励", "level": "等级",
            "inventory": "背包", "character": "角色", "player": "玩家",
            "enemy": "敌人", "boss": "首领", "dungeon": "地下城",
            "potion": "药水", "spell": "法术", "craft": "制作",
            "inventory": "物品栏", "respawn": "重生",
            "fireball": "火球术", "lightning": "闪电",
            "healing": "治疗", "poison": "毒",
            "critical": "暴击", "dodge": "闪避",
            # 科技常用
            "download": "下载", "upload": "上传", "browser": "浏览器",
            "network": "网络", "system": "系统", "process": "进程",
            "memory": "内存", "storage": "存储", "display": "显示",
            "resolution": "分辨率", "pixel": "像素", "render": "渲染",
            "shader": "着色器", "texture": "纹理", "model": "模型",
            "animation": "动画", "physics": "物理", "engine": "引擎",
            "framework": "框架", "library": "库", "module": "模块",
            "database": "数据库", "server": "服务器", "client": "客户端",
            "protocol": "协议", "encryption": "加密", "authentication": "认证",
            "algorithm": "算法", "variable": "变量", "function": "函数",
            "parameter": "参数", "interface": "接口", "component": "组件",
            "dependency": "依赖", "configuration": "配置",
            # 学术常用
            "theory": "理论", "hypothesis": "假设", "experiment": "实验",
            "analysis": "分析", "conclusion": "结论", "evidence": "证据",
            "research": "研究", "method": "方法", "result": "结果",
            "significant": "显著的", "correlation": "相关性",
            "velocity": "速度", "acceleration": "加速度",
            "gravity": "重力", "frequency": "频率",
            "molecule": "分子", "element": "元素", "compound": "化合物",
            "organism": "有机体", "ecosystem": "生态系统",
            "civilization": "文明", "revolution": "革命",
            "democracy": "民主", "philosophy": "哲学",
        }
