"""白泽运行模式选择栏。"""

from PySide6.QtCore import Signal, Qt
from PySide6.QtWidgets import QButtonGroup, QHBoxLayout, QPushButton, QWidget


class ModeBar(QWidget):
    mode_selected = Signal(str)

    def __init__(self) -> None:
        super().__init__(None)
        self.setObjectName("modeBar")
        self.setWindowFlags(
            Qt.WindowType.Tool
            | Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

        self._buttons = QButtonGroup(self)
        self._buttons.setExclusive(True)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(6)

        self.wudao_button = self._create_button(
            "悟道",
            "关闭截图与截图分析",
            "wudao",
        )
        self.jiangdao_button = self._create_button(
            "讲道",
            "开启全部功能",
            "jiangdao",
        )
        layout.addWidget(self.wudao_button)
        layout.addWidget(self.jiangdao_button)

        self.setStyleSheet(
            """
            QWidget#modeBar {
                background: rgba(245, 250, 255, 248);
                border: 2px solid #8ebce8;
                border-radius: 15px;
            }
            QPushButton {
                min-width: 70px;
                padding: 7px 12px;
                color: #315b7d;
                background: transparent;
                border: 1px solid transparent;
                border-radius: 10px;
                font: 14px "Microsoft YaHei";
            }
            QPushButton:hover {
                background: #e2f1ff;
            }
            QPushButton:checked {
                color: white;
                background: #4b91d1;
                border-color: #3477b7;
                font-weight: bold;
            }
            """
        )
        self.wudao_button.setChecked(True)
        self.adjustSize()

    def _create_button(
        self,
        title: str,
        tooltip: str,
        mode: str,
    ) -> QPushButton:
        button = QPushButton(title)
        button.setObjectName(f"{mode}Button")
        button.setToolTip(tooltip)
        button.setCheckable(True)
        button.clicked.connect(lambda checked: checked and self.mode_selected.emit(mode))
        self._buttons.addButton(button)
        return button

    def set_mode(self, mode: str) -> None:
        if mode == "jiangdao":
            self.jiangdao_button.setChecked(True)
        else:
            self.wudao_button.setChecked(True)
