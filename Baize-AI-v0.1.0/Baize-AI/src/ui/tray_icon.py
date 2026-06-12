"""系统托盘图标"""
from PyQt5.QtWidgets import QSystemTrayIcon, QMenu, QAction, QApplication
from PyQt5.QtGui import QIcon
import os


class TrayIcon(QSystemTrayIcon):
    """系统托盘 - 最小化到托盘、快速操作"""

    def __init__(self, parent=None, on_quit=None, on_toggle_pause=None,
                 on_show_stats=None, on_show_settings=None):
        super().__init__(parent)
        self._on_quit = on_quit
        self._on_toggle_pause = on_toggle_pause
        self._on_show_stats = on_show_stats
        self._on_show_settings = on_show_settings

        self._setup_icon()
        self._setup_menu()
        self.activated.connect(self._on_activated)

    def _setup_icon(self):
        icon_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "assets", "images", "baize.png"
        )
        if os.path.exists(icon_path):
            self.setIcon(QIcon(icon_path))
        else:
            self.setIcon(QApplication.style().standardIcon(
                QApplication.style().SP_ComputerIcon))
        self.setToolTip("白泽 AI · 运行中")

    def _setup_menu(self):
        menu = QMenu()

        act_show = menu.addAction("🐾 显示白泽")
        act_show.triggered.connect(lambda: self.parent().show() if self.parent() else None)

        menu.addSeparator()

        self._act_pause = menu.addAction("⏸ 暂停感知")
        self._act_pause.triggered.connect(self._toggle_pause)

        menu.addSeparator()

        act_stats = menu.addAction("📊 学习统计")
        act_stats.triggered.connect(self._show_stats)

        act_settings = menu.addAction("⚙️ 设置")
        act_settings.triggered.connect(self._show_settings)

        menu.addSeparator()

        act_quit = menu.addAction("❌ 退出")
        act_quit.triggered.connect(self._quit)

        self.setContextMenu(menu)

    def update_pause_state(self, paused: bool):
        self._act_pause.setText("▶ 恢复感知" if paused else "⏸ 暂停感知")
        self.setToolTip("白泽 AI · 已暂停" if paused else "白泽 AI · 运行中")

    # ── 内部回调 ──

    def _on_activated(self, reason):
        if reason == QSystemTrayIcon.DoubleClick:
            if self.parent():
                self.parent().show()

    def _toggle_pause(self):
        if self._on_toggle_pause:
            self._on_toggle_pause()

    def _show_stats(self):
        if self._on_show_stats:
            self._on_show_stats()

    def _show_settings(self):
        if self._on_show_settings:
            self._on_show_settings()

    def _quit(self):
        if self._on_quit:
            self._on_quit()
