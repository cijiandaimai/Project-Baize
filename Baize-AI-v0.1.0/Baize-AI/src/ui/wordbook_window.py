"""词汇本界面"""
from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QTableWidget,
                              QTableWidgetItem, QHeaderView, QComboBox,
                              QHBoxLayout, QLabel)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
from src.database import Database

CATEGORY_NAMES = {
    "all": "📖 全部",
    "english": "🔤 英语",
    "math": "🔢 数学",
    "physics": "⚡ 物理",
    "chemistry": "🧪 化学",
    "history": "📜 历史",
    "geography": "🌍 地理",
    "computer": "💻 计算机",
    "general": "✨ 综合",
}


class WordBookWindow(QDialog):
    """词汇本 - 查看已学单词"""

    def __init__(self, database: Database, parent=None):
        super().__init__(parent)
        self.db = database
        self.setWindowTitle("📖 词汇本")
        self.setMinimumSize(680, 450)
        self.setStyleSheet("QDialog { background: #fafafa; }")
        self._setup_ui()
        self._load_words()

    def _setup_ui(self):
        layout = QVBoxLayout(self)

        # 顶栏
        top = QHBoxLayout()
        top.addWidget(QLabel("📖 我的词汇本"))
        top.addStretch()

        self.cmb_filter = QComboBox()
        for key, name in CATEGORY_NAMES.items():
            self.cmb_filter.addItem(name, key)
        self.cmb_filter.currentIndexChanged.connect(self._load_words)
        self.cmb_filter.setFixedWidth(140)
        top.addWidget(self.cmb_filter)
        layout.addLayout(top)

        # 表格
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels(["单词", "释义", "分类", "学习时间", "复习"])
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
        self.table.setAlternatingRowColors(True)
        self.table.setEditTriggers(QTableWidget.NoEditTriggers)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.verticalHeader().setVisible(False)
        self.table.setStyleSheet("""
            QTableWidget {
                gridline-color: #eee;
                alternate-background-color: #f5f5f5;
            }
            QHeaderView::section {
                background: #e3f2fd; padding: 6px;
                border: 1px solid #ddd; font-weight: bold;
            }
        """)
        layout.addWidget(self.table)

        # 底部信息
        self.lbl_info = QLabel()
        self.lbl_info.setStyleSheet("color: #888; padding: 4px;")
        layout.addWidget(self.lbl_info)

    def _load_words(self):
        cat = self.cmb_filter.currentData()
        words = self.db.get_words(category=None if cat == "all" else cat, limit=200)

        self.table.setRowCount(len(words))
        for i, w in enumerate(words):
            self.table.setItem(i, 0, QTableWidgetItem(w.get("word", "")))
            self.table.setItem(i, 1, QTableWidgetItem(w.get("translation", "")))
            cat_name = CATEGORY_NAMES.get(w.get("category", "general"), "✨")
            self.table.setItem(i, 2, QTableWidgetItem(cat_name))
            self.table.setItem(i, 3, QTableWidgetItem(w.get("learned_at", "")))
            count = str(w.get("review_count", 0))
            self.table.setItem(i, 4, QTableWidgetItem(f"{count} 次"))

        self.lbl_info.setText(f"共 {len(words)} 个单词")
