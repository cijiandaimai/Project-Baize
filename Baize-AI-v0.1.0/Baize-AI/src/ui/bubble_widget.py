"""悬浮气泡组件 - 显示知识卡片"""
from PyQt5.QtWidgets import QWidget, QLabel, QVBoxLayout, QHBoxLayout, QPushButton
from PyQt5.QtCore import Qt, QTimer, pyqtSignal
from PyQt5.QtGui import QFont, QColor


class BubbleWidget(QWidget):
    """知识气泡 - 靠近白泽弹出，显示单词/知识点"""

    clicked_more = pyqtSignal(str)  # 点击"详情"时发射单词

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowFlags(
            Qt.FramelessWindowHint
            | Qt.WindowStaysOnTopHint
            | Qt.Tool
            | Qt.WindowTransparentForInput
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setAttribute(Qt.WA_ShowWithoutActivating)

        self._setup_ui()

        self._auto_close = QTimer(self)
        self._auto_close.setSingleShot(True)
        self._auto_close.timeout.connect(self.fade_out)

    def _setup_ui(self):
        container = QVBoxLayout(self)
        container.setContentsMargins(0, 0, 0, 0)

        card = QWidget()
        card.setStyleSheet("""
            QWidget#card {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #e3f2fd, stop:1 #bbdefb);
                border: 2px solid #90caf9;
                border-radius: 12px;
            }
        """)
        card.setObjectName("card")

        layout = QVBoxLayout(card)
        layout.setSpacing(6)
        layout.setContentsMargins(16, 12, 16, 12)

        # 标题行
        self.lbl_title = QLabel()
        self.lbl_title.setFont(QFont("Microsoft YaHei", 14, QFont.Bold))
        self.lbl_title.setStyleSheet("color: #1a237e; background: transparent;")
        self.lbl_title.setWordWrap(True)
        layout.addWidget(self.lbl_title)

        # 释义
        self.lbl_content = QLabel()
        self.lbl_content.setFont(QFont("Microsoft YaHei", 10))
        self.lbl_content.setStyleSheet("color: #333; background: transparent;")
        self.lbl_content.setWordWrap(True)
        self.lbl_content.setMaximumWidth(320)
        layout.addWidget(self.lbl_content)

        # 例句
        self.lbl_example = QLabel()
        self.lbl_example.setFont(QFont("Microsoft YaHei", 9))
        self.lbl_example.setStyleSheet("color: #666; background: transparent;")
        self.lbl_example.setWordWrap(True)
        self.lbl_example.setMaximumWidth(320)
        self.lbl_example.setVisible(False)
        layout.addWidget(self.lbl_example)

        # 底部操作
        bottom = QHBoxLayout()
        bottom.addStretch()

        self.btn_detail = QPushButton("了解更多 →")
        self.btn_detail.setCursor(Qt.PointingHandCursor)
        self.btn_detail.setStyleSheet("""
            QPushButton {
                color: #1976d2; background: transparent;
                border: none; font-size: 11px;
            }
            QPushButton:hover { color: #0d47a1; text-decoration: underline; }
        """)
        self.btn_detail.clicked.connect(self._on_detail)
        bottom.addWidget(self.btn_detail)
        layout.addLayout(bottom)

        container.addWidget(card)

    # ── 公共方法 ──

    def show_knowledge(self, word: str, content: str,
                       example: str = "", category: str = "",
                       duration: int = 8000):
        """显示知识气泡"""
        cat_label = {
            "english": "🔤 英语",
            "math": "🔢 数学",
            "physics": "⚡ 物理",
            "chemistry": "🧪 化学",
            "history": "📜 历史",
            "geography": "🌍 地理",
            "computer": "💻 计算机",
            "general": "✨ 知识",
        }.get(category, "✨ 知识")

        self.lbl_title.setText(f"{cat_label} | {word}")
        self.lbl_content.setText(content)

        if example:
            self.lbl_example.setText(f"💡 {example}")
            self.lbl_example.setVisible(True)
        else:
            self.lbl_example.setVisible(False)

        self.adjustSize()
        self.show()
        self.raise_()

        self._auto_close.start(duration)

    def fade_out(self):
        """淡出关闭"""
        self.hide()

    def _on_detail(self):
        word = self.lbl_title.text().split("|")[-1].strip()
        self.clicked_more.emit(word)
