from pathlib import Path

from PySide6.QtCore import QPoint, Qt
from PySide6.QtWidgets import QLabel

from src.app import create_application, resource_path
from src.mode_bar import ModeBar
from src.pet_window import PetWindow


def test_resource_path_points_to_project_asset() -> None:
    path = resource_path("assets", "images", "baize-idle-v11.png")
    assert path.is_file()
    animation_dir = resource_path("assets", "animations", "idle")
    assert animation_dir.is_dir()
    assert len(list(animation_dir.glob("frame_*.png"))) > 10


def test_pet_window_has_safe_minimal_flags() -> None:
    app = create_application(["pytest"])
    window = PetWindow(
        resource_path("assets", "images", "baize-idle-v11.png"),
        resource_path("assets", "animations", "idle"),
    )

    flags = window.windowFlags()
    assert flags & Qt.WindowType.FramelessWindowHint
    assert flags & Qt.WindowType.WindowStaysOnTopHint
    assert window.findChild(QLabel, "petImage") is not None
    assert app.applicationName() == "白泽桌面宠物"

    window.close()


def test_pet_window_loads_idle_animation() -> None:
    create_application(["pytest"])
    window = PetWindow(
        resource_path("assets", "images", "baize-idle-v11.png"),
        resource_path("assets", "animations", "idle"),
    )

    assert len(window._animation_frames) > 10
    assert window._animation_timer.isActive()

    window.close()


def test_pet_starts_in_wudao_mode() -> None:
    create_application(["pytest"])
    window = PetWindow(resource_path("assets", "images", "baize-idle-v11.png"))

    assert window.feature_mode == "wudao"
    assert window.screenshot_enabled is False
    assert window.analysis_enabled is False

    window.close()


def test_feature_mode_switches_all_function_flags() -> None:
    create_application(["pytest"])
    window = PetWindow(resource_path("assets", "images", "baize-idle-v11.png"))

    window.set_feature_mode("jiangdao")
    assert window.feature_mode == "jiangdao"
    assert window.screenshot_enabled is True
    assert window.analysis_enabled is True

    window.set_feature_mode("wudao")
    assert window.screenshot_enabled is False
    assert window.analysis_enabled is False

    window.close()


def test_mode_bar_stays_inside_screen_when_pet_near_edge() -> None:
    app = create_application(["pytest"])
    window = PetWindow(resource_path("assets", "images", "baize-idle-v11.png"))
    area = app.primaryScreen().availableGeometry()

    window.move(area.right() - 10, area.bottom() - window.height())
    window.toggle_mode_bar()
    mode_bar = window._mode_bar

    assert mode_bar.x() + mode_bar.width() <= area.right() - 8
    assert mode_bar.x() >= area.left() + 8

    window.close()


def test_status_bubble_appears_above_mode_bar() -> None:
    app = create_application(["pytest"])
    window = PetWindow(resource_path("assets", "images", "baize-idle-v11.png"))

    window.move(QPoint(200, 200))
    window.toggle_mode_bar()
    window.set_feature_mode("jiangdao")

    assert window._bubble.y() + window._bubble.height() <= window._mode_bar.y()

    window.close()


def test_mode_bar_has_two_mode_buttons() -> None:
    create_application(["pytest"])
    bar = ModeBar()

    assert bar.wudao_button.text() == "悟道"
    assert bar.jiangdao_button.text() == "讲道"
    assert bar.wudao_button.isChecked()

    bar.close()


def test_runtime_source_has_no_screen_or_network_modules() -> None:
    source_dir = Path(__file__).resolve().parent.parent / "src"
    source = "\n".join(
        path.read_text(encoding="utf-8") for path in source_dir.glob("*.py")
    )

    forbidden_imports = (
        "import requests",
        "import pyautogui",
        "import mss",
        "QScreen.grabWindow",
    )
    assert not any(item in source for item in forbidden_imports)
