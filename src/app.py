"""应用初始化。"""

import sys
from pathlib import Path

from PySide6.QtGui import QIcon
from PySide6.QtWidgets import QApplication

from src import __version__
from src.pet_window import PetWindow


def resource_path(*parts: str) -> Path:
    bundle_dir = getattr(sys, "_MEIPASS", None)
    base_dir = Path(bundle_dir) if bundle_dir else Path(__file__).resolve().parent.parent
    return base_dir.joinpath(*parts)


def create_application(argv: list[str] | None = None) -> QApplication:
    app = QApplication.instance() or QApplication(argv or sys.argv)
    app.setApplicationName("白泽桌面宠物")
    app.setApplicationVersion(__version__)
    app.setQuitOnLastWindowClosed(True)

    image_path = resource_path("assets", "images", "baize-idle-v11.png")
    if image_path.exists():
        app.setWindowIcon(QIcon(str(image_path)))

    return app


def run() -> int:
    app = create_application()
    window = PetWindow(
        resource_path("assets", "images", "baize-idle-v11.png"),
        resource_path("assets", "animations", "idle"),
    )
    window.show()
    return app.exec()
