"""桌宠问候气泡。"""

from PySide6.QtCore import Qt, QTimer
from PySide6.QtWidgets import QLabel


class SpeechBubble(QLabel):
    def __init__(self) -> None:
        super().__init__(None)
        self.setWindowFlags(
            Qt.WindowType.ToolTip
            | Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setWordWrap(True)
        self.setMaximumWidth(280)
        self.setStyleSheet(
            """
            QLabel {
                color: #183153;
                background: rgba(255, 255, 255, 245);
                border: 2px solid #9dc9f5;
                border-radius: 12px;
                padding: 10px 14px;
                font: 14px "Microsoft YaHei";
            }
            """
        )

        self._hide_timer = QTimer(self)
        self._hide_timer.setSingleShot(True)
        self._hide_timer.timeout.connect(self.hide)

    def show_message(self, message: str, anchor_x: int, anchor_y: int) -> None:
        self.setText(message)
        self.adjustSize()
        self.move(anchor_x - self.width(), anchor_y - self.height() - 8)
        self.show()
        self.raise_()
        self._hide_timer.start(5000)

    def show_above(self, message: str, center_x: int, top_y: int) -> None:
        self.setText(message)
        self.adjustSize()
        x = center_x - self.width() // 2
        y = top_y - self.height() - 10
        screen = self.screen()
        if screen is not None:
            area = screen.availableGeometry()
            x = max(area.left() + 8, min(x, area.right() - self.width() - 8))
            y = max(area.top() + 8, y)
        self.move(x, y)
        self.show()
        self.raise_()
        self._hide_timer.start(2600)
