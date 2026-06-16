"""安全离线版白泽桌面宠物窗口。"""

import json
from pathlib import Path

from PySide6.QtCore import QPoint, QTimer, Signal, Qt
from PySide6.QtGui import QAction, QMouseEvent, QPixmap
from PySide6.QtWidgets import (
    QApplication,
    QLabel,
    QMainWindow,
    QMenu,
    QMessageBox,
    QVBoxLayout,
    QWidget,
)

from src import __version__
from src.bubble import SpeechBubble
from src.mode_bar import ModeBar


class PetWindow(QMainWindow):
    mode_changed = Signal(str)

    PET_SIZE = 220

    def __init__(self, image_path: Path, animation_dir: Path | None = None) -> None:
        super().__init__()
        self._drag_offset: QPoint | None = None
        self._press_position: QPoint | None = None
        self._feature_mode = "wudao"
        self._screenshot_enabled = False
        self._analysis_enabled = False
        self._animation_frames: list[QPixmap] = []
        self._animation_index = 0
        self._animation_timer = QTimer(self)
        self._animation_timer.timeout.connect(self._advance_animation)
        self._bubble = SpeechBubble()
        self._mode_bar = ModeBar()
        self._mode_bar.mode_selected.connect(self.set_feature_mode)

        self.setObjectName("petWindow")
        self.setWindowTitle("白泽桌面宠物")
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
            | Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setFixedSize(self.PET_SIZE, self.PET_SIZE)

        self._pet_label = QLabel()
        self._pet_label.setObjectName("petImage")
        self._pet_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._pet_label.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents)
        self._load_image(image_path)
        self._load_animation(animation_dir)

        central = QWidget()
        central.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        layout = QVBoxLayout(central)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(self._pet_label)
        self.setCentralWidget(central)

        self._move_to_bottom_right()

    def _load_image(self, image_path: Path) -> None:
        pixmap = QPixmap(str(image_path))
        if pixmap.isNull():
            self._pet_label.setText("白泽")
            self._pet_label.setStyleSheet(
                'color: #315b7d; font: bold 28px "Microsoft YaHei";'
            )
            return

        self._pet_label.setPixmap(
            pixmap.scaled(
                self.PET_SIZE,
                self.PET_SIZE,
                Qt.AspectRatioMode.KeepAspectRatio,
                Qt.TransformationMode.SmoothTransformation,
            )
        )

    def _load_animation(self, animation_dir: Path | None) -> None:
        if animation_dir is None or not animation_dir.is_dir():
            return

        frames: list[QPixmap] = []
        for frame_path in sorted(animation_dir.glob("frame_*.png")):
            pixmap = QPixmap(str(frame_path))
            if pixmap.isNull():
                continue
            frames.append(
                pixmap.scaled(
                    self.PET_SIZE,
                    self.PET_SIZE,
                    Qt.AspectRatioMode.KeepAspectRatio,
                    Qt.TransformationMode.SmoothTransformation,
                )
            )

        if not frames:
            return

        fps = 12
        metadata_path = animation_dir / "metadata.json"
        if metadata_path.is_file():
            try:
                metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
                fps = int(metadata.get("fps", fps))
            except (OSError, ValueError, TypeError):
                fps = 12

        self._animation_frames = frames
        self._animation_index = 0
        self._pet_label.setPixmap(self._animation_frames[0])
        self._animation_timer.start(max(20, round(1000 / max(1, fps))))

    def _advance_animation(self) -> None:
        if not self._animation_frames:
            return
        self._animation_index = (self._animation_index + 1) % len(self._animation_frames)
        self._pet_label.setPixmap(self._animation_frames[self._animation_index])

    def _move_to_bottom_right(self) -> None:
        screen = QApplication.primaryScreen()
        if screen is None:
            return
        area = screen.availableGeometry()
        self.move(
            area.right() - self.width() - 24,
            area.bottom() - self.height() - 24,
        )

    @property
    def feature_mode(self) -> str:
        return self._feature_mode

    @property
    def screenshot_enabled(self) -> bool:
        return self._screenshot_enabled

    @property
    def analysis_enabled(self) -> bool:
        return self._analysis_enabled

    def toggle_mode_bar(self) -> None:
        if self._mode_bar.isVisible():
            self._mode_bar.hide()
            return
        self._position_mode_bar()
        self._mode_bar.show()
        self._mode_bar.raise_()

    def _position_mode_bar(self) -> None:
        self._mode_bar.adjustSize()
        x = self.x() + (self.width() - self._mode_bar.width()) // 2
        y = self.y() - self._mode_bar.height() - 8
        screen = self.screen() or QApplication.primaryScreen()
        if screen is not None:
            area = screen.availableGeometry()
            x = max(area.left() + 8, min(x, area.right() - self._mode_bar.width() - 8))
            if y < area.top() + 8:
                y = self.y() + 8
        self._mode_bar.move(x, y)

    def set_feature_mode(self, mode: str) -> None:
        if mode not in {"wudao", "jiangdao"}:
            raise ValueError(f"Unknown feature mode: {mode}")

        self._feature_mode = mode
        enabled = mode == "jiangdao"
        self._screenshot_enabled = enabled
        self._analysis_enabled = enabled
        self._mode_bar.set_mode(mode)
        self.mode_changed.emit(mode)

        if enabled:
            message = "讲道：功能已开启"
        else:
            message = "悟道：截图分析已关闭"
        self._position_mode_bar()
        self._bubble.show_above(
            message,
            self._mode_bar.x() + self._mode_bar.width() // 2,
            self._mode_bar.y(),
        )

    def mousePressEvent(self, event: QMouseEvent) -> None:
        if event.button() == Qt.MouseButton.LeftButton:
            self._drag_offset = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            self._press_position = event.globalPosition().toPoint()
            event.accept()
            return
        if event.button() == Qt.MouseButton.RightButton:
            self._show_context_menu(event.globalPosition().toPoint())
            event.accept()
            return
        super().mousePressEvent(event)

    def mouseMoveEvent(self, event: QMouseEvent) -> None:
        if (
            self._drag_offset is not None
            and event.buttons() & Qt.MouseButton.LeftButton
        ):
            self.move(event.globalPosition().toPoint() - self._drag_offset)
            event.accept()
            return
        super().mouseMoveEvent(event)

    def mouseReleaseEvent(self, event: QMouseEvent) -> None:
        if event.button() == Qt.MouseButton.LeftButton:
            released_at = event.globalPosition().toPoint()
            if (
                self._press_position is not None
                and (released_at - self._press_position).manhattanLength() < 6
            ):
                self.toggle_mode_bar()
            self._drag_offset = None
            self._press_position = None
            event.accept()
            return
        super().mouseReleaseEvent(event)

    def moveEvent(self, event) -> None:
        if self._mode_bar.isVisible():
            self._position_mode_bar()
        super().moveEvent(event)

    def _show_context_menu(self, position: QPoint) -> None:
        menu = QMenu(self)
        about_action = QAction("关于白泽", self)
        about_action.triggered.connect(self._show_about)
        quit_action = QAction("退出", self)
        quit_action.triggered.connect(QApplication.quit)
        menu.addAction(about_action)
        menu.addSeparator()
        menu.addAction(quit_action)
        menu.exec(position)

    def _show_about(self) -> None:
        QMessageBox.information(
            self,
            "关于白泽",
            f"白泽桌面宠物 {__version__}\n\n"
            "悟道：关闭截图与截图分析。\n"
            "讲道：开启全部功能。\n\n"
            "当前最小版本尚未接入实际截图模块。",
        )

    def closeEvent(self, event) -> None:
        self._animation_timer.stop()
        self._mode_bar.close()
        self._bubble.close()
        super().closeEvent(event)
