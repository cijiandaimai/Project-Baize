"""学习统计界面"""
from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QLabel, QGroupBox,
                              QFormLayout, QProgressBar, QHBoxLayout)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont


CATEGORY_NAMES = {
    "english": "🔤 英语",
    "math": "🔢 数学",
    "physics": "⚡ 物理",
    "chemistry": "🧪 化学",
    "history": "📜 历史",
    "geography": "🌍 地理",
    "computer": "💻 计算机",
    "general": "✨ 综合",
}


class StatsWindow(QDialog):
    """学习统计面板"""

    def __init__(self, stats: dict, parent=None):
        super().__init__(parent)
        self.setWindowTitle("📊 学习统计")
        self.setMinimumSize(420, 400)
        self.setStyleSheet("QDialog { background: #fafafa; }")
        self.stats = stats
        self._setup_ui()

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(16)

        # ── 概览 ──
        grp_overview = QGroupBox("📈 学习概览")
        grp_overview.setFont(QFont("Microsoft YaHei", 10, QFont.Bold))
        f = QFormLayout()

        lbl_total = QLabel(f"<b>{self.stats.get('total_words', 0)}</b> 个")
        lbl_total.setTextFormat(Qt.RichText)
        f.addRow("已学单词:", lbl_total)

        lbl_today = QLabel(f"<b>{self.stats.get('words_today', 0)}</b> 个")
        lbl_today.setTextFormat(Qt.RichText)
        f.addRow("今日新增:", lbl_today)

        lbl_streak = QLabel(f"<b>{self.stats.get('streak', 0)}</b> 天 🔥")
        lbl_streak.setTextFormat(Qt.RichText)
        f.addRow("连续学习:", lbl_streak)

        lbl_days = QLabel(f"<b>{self.stats.get('study_days', 0)}</b> 天")
        lbl_days.setTextFormat(Qt.RichText)
        f.addRow("累计学习:", lbl_days)

        grp_overview.setLayout(f)
        layout.addWidget(grp_overview)

        # ── 分类统计 ──
        grp_cat = QGroupBox("📚 分类掌握")
        grp_cat.setFont(QFont("Microsoft YaHei", 10, QFont.Bold))
        cat_layout = QVBoxLayout()

        cats = self.stats.get("categories", {})
        total = max(sum(cats.values()), 1)

        if not cats:
            lbl_empty = QLabel("还没有学习记录，快去探索吧！")
            lbl_empty.setStyleSheet("color: #999; padding: 12px;")
            lbl_empty.setAlignment(Qt.AlignCenter)
            cat_layout.addWidget(lbl_empty)
        else:
            for cat_key, count in sorted(cats.items(), key=lambda x: -x[1]):
                row = QHBoxLayout()
                name = CATEGORY_NAMES.get(cat_key, cat_key)
                row.addWidget(QLabel(f"{name}"))

                bar = QProgressBar()
                bar.setMaximum(total)
                bar.setValue(count)
                bar.setTextVisible(False)
                bar.setFixedHeight(14)
                bar.setStyleSheet("""
                    QProgressBar {
                        border: 1px solid #ddd; border-radius: 7px;
                        background: #eee; text-align: center;
                    }
                    QProgressBar::chunk {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #42a5f5, stop:1 #1976d2);
                        border-radius: 7px;
                    }
                """)
                row.addWidget(bar, 1)
                row.addWidget(QLabel(f"{count}"))
                cat_layout.addLayout(row)

        grp_cat.setLayout(cat_layout)
        layout.addWidget(grp_cat)

        layout.addStretch()
