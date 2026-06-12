"""数据管理模块 - 学习记录、词汇本"""
import os
import json
import time
from datetime import datetime, timedelta
from src.config import get_data_path

WORDS_FILE = "learned_words.json"
STATS_FILE = "learning_stats.json"


class Database:
    """本地学习数据管理"""

    def __init__(self):
        self._words_path = get_data_path(WORDS_FILE)
        self._stats_path = get_data_path(STATS_FILE)
        self.words = self._load_words()
        self.stats = self._load_stats()

    # ── 词汇管理 ──

    def add_word(self, word: str, translation: str = "",
                 category: str = "general", example: str = "") -> bool:
        """添加新学到的单词，返回是否为新增"""
        word_lower = word.lower().strip()
        if not word_lower:
            return False

        for w in self.words:
            if w.get("word", "").lower() == word_lower:
                # 已存在，更新复习时间
                w["last_review"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                w["review_count"] = w.get("review_count", 0) + 1
                self._save_words()
                return False

        entry = {
            "word": word_lower,
            "translation": translation,
            "category": category,
            "example": example,
            "learned_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "last_review": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "review_count": 1,
            "mastered": False,
        }
        self.words.append(entry)
        self._save_words()

        # 更新统计
        self.stats["total_words"] = len(self.words)
        self._update_daily_stats("words_today")
        self._save_stats()
        return True

    def get_words(self, category: str = None, limit: int = 100) -> list:
        """获取词汇列表"""
        result = self.words
        if category:
            result = [w for w in result if w.get("category") == category]
        return sorted(result, key=lambda x: x.get("learned_at", ""), reverse=True)[:limit]

    def get_word_count(self) -> int:
        return len(self.words)

    def get_categories(self) -> dict:
        """按分类统计词汇数"""
        cats = {}
        for w in self.words:
            cat = w.get("category", "general")
            cats[cat] = cats.get(cat, 0) + 1
        return cats

    def get_words_for_review(self) -> list:
        """获取需要复习的单词（基于艾宾浩斯遗忘曲线）"""
        now = datetime.now()
        review_intervals = [1, 2, 4, 7, 15, 30]  # 天
        result = []
        for w in self.words:
            if w.get("mastered"):
                continue
            last = w.get("last_review", w.get("learned_at", ""))
            if not last:
                result.append(w)
                continue
            try:
                last_dt = datetime.strptime(last, "%Y-%m-%d %H:%M:%S")
                days = (now - last_dt).days
                count = min(w.get("review_count", 1), len(review_intervals)) - 1
                if days >= review_intervals[max(0, count)]:
                    result.append(w)
            except ValueError:
                result.append(w)
        return result

    # ── 学习统计 ──

    def get_stats(self) -> dict:
        """获取学习统计"""
        return {
            "total_words": len(self.words),
            "categories": self.get_categories(),
            "words_today": self.stats.get("words_today", 0),
            "study_days": self.stats.get("study_days", 1),
            "streak": self.stats.get("streak", 0),
            "last_study_date": self.stats.get("last_study_date", ""),
            "history": self.stats.get("history", []),
        }

    def record_study_session(self, words_count: int):
        """记录一次学习会话"""
        today = datetime.now().strftime("%Y-%m-%d")
        last_date = self.stats.get("last_study_date", "")

        if last_date != today:
            yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            if last_date == yesterday:
                self.stats["streak"] = self.stats.get("streak", 0) + 1
            else:
                self.stats["streak"] = 1
            self.stats["study_days"] = self.stats.get("study_days", 0) + 1
            self.stats["last_study_date"] = today
            self.stats["words_today"] = 0

        self.stats["words_today"] = self.stats.get("words_today", 0) + words_count

        # 记录历史
        history = self.stats.get("history", [])
        history.append({
            "date": today,
            "words": words_count,
            "timestamp": time.time(),
        })
        # 只保留最近 90 天
        self.stats["history"] = history[-90:]
        self._save_stats()

    # ── 内部方法 ──

    def _update_daily_stats(self, key: str):
        today = datetime.now().strftime("%Y-%m-%d")
        if self.stats.get("last_study_date") != today:
            self.stats[key] = 0
        self.stats[key] = self.stats.get(key, 0) + 1

    def _load_words(self) -> list:
        path = self._words_path
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return []

    def _save_words(self):
        with open(self._words_path, "w", encoding="utf-8") as f:
            json.dump(self.words, f, ensure_ascii=False, indent=2)

    def _load_stats(self) -> dict:
        path = self._stats_path
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {"study_days": 0, "streak": 0, "words_today": 0, "history": []}

    def _save_stats(self):
        with open(self._stats_path, "w", encoding="utf-8") as f:
            json.dump(self.stats, f, ensure_ascii=False, indent=2)
