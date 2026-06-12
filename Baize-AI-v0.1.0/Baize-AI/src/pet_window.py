"""白泽桌面宠物窗口 - 核心交互界面"""
import os
import sys
from PyQt5.QtWidgets import (QMainWindow, QWidget, QLabel, QVBoxLayout,
                              QApplication, QMenu, QAction, QSystemTrayIcon,
                              QMessageBox)
from PyQt5.QtCore import Qt, QPoint, QTimer, QPropertyAnimation, QEasingCurve
from PyQt5.QtGui import QPixmap, QImage, QFont, QIcon, QCursor

from src.ui.bubble_widget import BubbleWidget
from src.ui.tray_icon import TrayIcon


class PetWindow(QMainWindow):
    """白泽桌面宠物主窗口"""

    PET_SIZE = 200

    def __init__(self, config: dict, database):
        super().__init__()
        self.config = config
        self.db = database
        self.paused = config.get("paused", False)
        self._drag_pos = None
        self._screen_analyzer = None

        self._setup_window()
        self._setup_ui()
        self._setup_animations()
        self._setup_tray()
        self._init_screen_analyzer()

        if self.paused:
            self.lbl_status.setText("💤 白泽在休息...")

    # ── 初始化 ──

    def _setup_window(self):
        self.setWindowFlags(
            Qt.FramelessWindowHint
            | Qt.WindowStaysOnTopHint
            | Qt.Tool
        )
        self.setAttribute(Qt.WA_TranslucentBackground)

        screen = QApplication.primaryScreen().geometry()
        self.setGeometry(
            screen.width() - self.PET_SIZE - 30,
            screen.height() - self.PET_SIZE - 120,
            self.PET_SIZE,
            self.PET_SIZE + 40
        )

    def _setup_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setAlignment(Qt.AlignBottom | Qt.AlignHCenter)
        layout.setSpacing(4)
        layout.setContentsMargins(0, 0, 0, 0)

        # 状态文字
        self.lbl_status = QLabel("")
        self.lbl_status.setAlignment(Qt.AlignCenter)
        self.lbl_status.setFont(QFont("Microsoft YaHei", 9))
        self.lbl_status.setStyleSheet(
            "color: #1976d2; background: transparent;")
        layout.addWidget(self.lbl_status)

        # 白泽形象
        self.lbl_pet = QLabel()
        self._load_pet_image()
        layout.addWidget(self.lbl_pet, 0, Qt.AlignHCenter)

    def _load_pet_image(self):
        image_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "assets", "images", "baize.png"
        )
        if os.path.exists(image_path):
            pixmap = QPixmap(image_path)
            size = self.PET_SIZE
            scaled = pixmap.scaled(size, size, Qt.KeepAspectRatio,
                                   Qt.SmoothTransformation)
            self.lbl_pet.setPixmap(scaled)
            self.lbl_pet.setFixedSize(size, size)
        else:
            self.lbl_pet.setText("白泽")
            self.lbl_pet.setFixedSize(self.PET_SIZE, self.PET_SIZE)
            self.lbl_pet.setAlignment(Qt.AlignCenter)
            self.lbl_pet.setFont(QFont("Microsoft YaHei", 24))
            self.lbl_pet.setStyleSheet(
                "background: #e3f2fd; border-radius: 100px;")

    def _setup_animations(self):
        """设置呼吸动画 - 轻微的上下浮动"""
        self._breath_timer = QTimer(self)
        self._breath_timer.timeout.connect(self._breath_tick)
        self._breath_timer.start(3000)
        self._breath_up = True

    def _breath_tick(self):
        """呼吸动画：上下浮动 3 像素"""
        if self.paused:
            return
        geo = self.geometry()
        offset = -3 if self._breath_up else 3
        geo.translate(0, offset)
        self.setGeometry(geo)
        self._breath_up = not self._breath_up

    def _setup_tray(self):
        self.tray = TrayIcon(
            parent=self,
            on_quit=self._tray_quit,
            on_toggle_pause=self.toggle_pause,
            on_show_stats=self.show_stats,
            on_show_settings=self.show_settings,
        )
        self.tray.show()

    def _init_screen_analyzer(self):
        from src.screen_analyzer import ScreenAnalyzer
        self._screen_analyzer = ScreenAnalyzer(
            parent=self,
            config=self.config,
            database=self.db,
            on_bubble=self.show_bubble,
        )
        if not self.paused:
            self._screen_analyzer.start()

        # 启动提示
        QTimer.singleShot(800, lambda: self.show_bubble(
            "✨ 白泽 AI",
            "你好呀！我是白泽，你的 AI 学习伙伴~\n"
            "我会在你玩游戏、看视频时悄悄教你知识！",
            example="右键点击我可以查看设置和词汇本哦",
            category="general",
        ))

    # ── 鼠标交互 ──

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self._drag_pos = event.globalPos() - self.frameGeometry().topLeft()
            event.accept()
        elif event.button() == Qt.RightButton:
            self._show_context_menu(event.globalPos())

    def mouseMoveEvent(self, event):
        if self._drag_pos and event.buttons() == Qt.LeftButton:
            self.move(event.globalPos() - self._drag_pos)
            event.accept()

    def mouseReleaseEvent(self, event):
        self._drag_pos = None

    def mouseDoubleClickEvent(self, event):
        messages = [
            "嘿！有什么不懂的尽管问我~",
            "今天也要加油哦！💪",
            "知识就是力量！✨",
            "你知道吗？白泽通晓万物之情~",
            "学一个知识点，我就恢复一点灵力！",
            "加油加油！我们一起变强！",
        ]
        import random
        msg = random.choice(messages)
        self.show_bubble("白泽", msg, category="general")

    # ── 右键菜单 ──

    def _show_context_menu(self, pos):
        menu = QMenu()
        menu.setStyleSheet("""
            QMenu {
                background: white; border: 1px solid #ddd;
                border-radius: 8px; padding: 4px;
            }
            QMenu::item {
                padding: 8px 24px; border-radius: 4px;
                font-size: 13px;
            }
            QMenu::item:selected { background: #e3f2fd; }
        """)

        pause_text = "▶ 恢复感知" if self.paused else "⏸ 暂停感知"
        act_pause = menu.addAction(pause_text)
        act_pause.triggered.connect(self.toggle_pause)

        menu.addSeparator()

        act_words = menu.addAction("📖 词汇本")
        act_words.triggered.connect(self.show_wordbook)

        act_stats = menu.addAction("📊 学习统计")
        act_stats.triggered.connect(self.show_stats)

        act_settings = menu.addAction("⚙️ 设置")
        act_settings.triggered.connect(self.show_settings)

        menu.addSeparator()

        act_about = menu.addAction("ℹ️ 关于白泽")
        act_about.triggered.connect(self._show_about)

        act_quit = menu.addAction("❌ 退出")
        act_quit.triggered.connect(self.close)

        menu.exec_(pos)

    # ── 功能方法 ──

    def toggle_pause(self):
        self.paused = not self.paused
        self.config["paused"] = self.paused

        if self._screen_analyzer:
            if self.paused:
                self._screen_analyzer.pause()
                self.lbl_status.setText("💤 白泽在休息...")
            else:
                self._screen_analyzer.resume()
                self.lbl_status.setText("")

        self.tray.update_pause_state(self.paused)

    def show_bubble(self, title, content, example="", category=""):
        """在白泽旁边弹出知识气泡"""
        if not hasattr(self, '_bubble') or self._bubble is None:
            self._bubble = BubbleWidget()
            self._bubble.clicked_more.connect(self._on_bubble_detail)

        # 计算气泡位置（在白泽左边）
        pet_geo = self.geometry()
        bx = pet_geo.x() - 340
        by = pet_geo.y() + 20

        screen = QApplication.primaryScreen().geometry()
        if bx < 10:
            bx = pet_geo.x() + self.PET_SIZE + 10
        if by < 10:
            by = 10
        if by + 200 > screen.height():
            by = screen.height() - 210

        self._bubble.move(bx, by)
        duration = self.config.get("bubble_duration", 8000)
        self._bubble.show_knowledge(title, content, example, category, duration)

    def _on_bubble_detail(self, word):
        """点击气泡「了解更多」"""
        self.show_bubble(
            f"📚 {word}",
            f"你正在学习: {word}\n"
            "完整版支持点击查看更多详情和例句~",
            category="general",
        )

    def show_wordbook(self):
        from src.ui.wordbook_window import WordBookWindow
        win = WordBookWindow(self.db, self)
        win.exec_()

    def show_stats(self):
        from src.ui.stats_window import StatsWindow
        win = StatsWindow(self.db.get_stats(), self)
        win.exec_()

    def show_settings(self):
        from src.ui.settings_window import SettingsWindow
        dlg = SettingsWindow(self.config, self)
        if dlg.exec_():
            self.config.update(dlg.config)
            if self._screen_analyzer:
                self._screen_analyzer.update_config(self.config)

    def _show_about(self):
        QMessageBox.about(self, "关于白泽 AI",
            "🐾 白泽 AI v0.1.0\n\n"
            "上古瑞兽白泽化身 AI 学习伙伴\n"
            "在你玩游戏、看视频时悄悄教你知识\n\n"
            "「吾本无形，因汝之智而具象\n"
            "  汝之所学，化吾之灵力」\n\n"
            "GitHub: github.com/Baize-AI")

    # ── 生命周期 ──

    def closeEvent(self, event):
        reply = QMessageBox.question(
            self, "退出白泽 AI",
            "确定要让白泽离开吗？\n它会一直在桌面等你的~",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            if self._screen_analyzer:
                self._screen_analyzer.stop()
            self.tray.hide()
            event.accept()
        else:
            event.ignore()

    def _tray_quit(self):
        if self._screen_analyzer:
            self._screen_analyzer.stop()
        self.tray.hide()
        QApplication.quit()
