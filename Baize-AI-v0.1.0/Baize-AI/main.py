"""
╔══════════════════════════════════════════════╗
║          白泽 AI · Baize AI Desktop Pet      ║
║  上古瑞兽白泽化身 AI 学习伙伴                  ║
║  在你玩游戏、看视频时悄悄教你知识               ║
║                                              ║
║  「吾本无形，因汝之智而具象                    ║
║    汝之所学，化吾之灵力」                      ║
╚══════════════════════════════════════════════╝

启动方式: python main.py
"""
import sys
import os
import logging

# ── 环境准备 ──
# Windows DPI 适配（必须在 QApplication 之前）
if sys.platform == "win32":
    try:
        from ctypes import windll
        windll.shcore.SetProcessDpiAwareness(1)
    except Exception:
        pass

# 项目根目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# 日志
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(name)s - %(levelname)s - %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("baize")


def main():
    from PyQt5.QtWidgets import QApplication
    from PyQt5.QtCore import Qt
    from PyQt5.QtGui import QPixmap

    app = QApplication(sys.argv)
    app.setApplicationName("白泽 AI")
    app.setApplicationVersion("0.1.0")
    app.setQuitOnLastWindowClosed(False)  # 关闭窗口时靠托盘退出

    # 设置应用图标
    icon_path = os.path.join(BASE_DIR, "assets", "images", "baize.png")
    if os.path.exists(icon_path):
        app.setWindowIcon(QPixmap(icon_path))

    # 加载配置和数据库
    from src.config import load_config
    from src.database import Database

    config = load_config()
    db = Database()

    logger.info("白泽 AI v0.1.0 启动中...")
    logger.info("用户年龄: %d, 检测间隔: %ds", config.get("user_age", 15),
                config.get("capture_interval", 3))

    # 启动白泽
    from src.pet_window import PetWindow
    window = PetWindow(config, db)
    window.show()

    logger.info("白泽已降临！🐾")
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
