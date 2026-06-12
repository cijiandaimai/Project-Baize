"""设置界面"""
from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel,
                              QSpinBox, QComboBox, QLineEdit, QPushButton,
                              QGroupBox, QFormLayout, QMessageBox)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
from src.config import save_config


class SettingsWindow(QDialog):
    """设置面板 - API密钥、用户信息、分析参数"""

    def __init__(self, config: dict, parent=None):
        super().__init__(parent)
        self.config = config.copy()
        self.setWindowTitle("⚙️ 白泽 AI 设置")
        self.setMinimumSize(500, 580)
        self.setStyleSheet("QDialog { background: #fafafa; }")
        self._setup_ui()

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(12)

        # ── 通用设置 ──
        grp_general = QGroupBox("🐾 通用设置")
        grp_general.setFont(QFont("Microsoft YaHei", 10, QFont.Bold))
        f = QFormLayout()

        self.spn_interval = QSpinBox()
        self.spn_interval.setRange(1, 30)
        self.spn_interval.setValue(self.config.get("capture_interval", 3))
        self.spn_interval.setSuffix(" 秒")
        self.spn_interval.setFixedWidth(100)
        f.addRow("屏幕检测间隔:", self.spn_interval)

        self.spn_age = QSpinBox()
        self.spn_age.setRange(6, 18)
        self.spn_age.setValue(self.config.get("user_age", 15))
        self.spn_age.setSuffix(" 岁")
        self.spn_age.setFixedWidth(100)
        f.addRow("我的年龄:", self.spn_age)

        self.cmb_gender = QComboBox()
        self.cmb_gender.addItems(["保密", "男", "女"])
        gender_map = {"unknown": 0, "male": 1, "female": 2}
        self.cmb_gender.setCurrentIndex(
            gender_map.get(self.config.get("user_gender", "unknown"), 0))
        f.addRow("性别:", self.cmb_gender)

        self.spn_bubble = QSpinBox()
        self.spn_bubble.setRange(3, 30)
        self.spn_bubble.setValue(self.config.get("bubble_duration", 8000) // 1000)
        self.spn_bubble.setSuffix(" 秒")
        self.spn_bubble.setFixedWidth(100)
        f.addRow("气泡显示时长:", self.spn_bubble)

        grp_general.setLayout(f)
        layout.addWidget(grp_general)

        # ── API 密钥 ──
        grp_api = QGroupBox("🔑 API 密钥（可选，不填则使用基础模式）")
        grp_api.setFont(QFont("Microsoft YaHei", 10, QFont.Bold))
        af = QFormLayout()

        self.inp_ocr_key = QLineEdit(self.config.get("baidu_ocr_api_key", ""))
        self.inp_ocr_key.setPlaceholderText("百度 OCR API Key")
        self.inp_ocr_key.setEchoMode(QLineEdit.Password)
        af.addRow("百度 OCR:", self.inp_ocr_key)

        self.inp_ocr_secret = QLineEdit(self.config.get("baidu_ocr_secret_key", ""))
        self.inp_ocr_secret.setPlaceholderText("百度 OCR Secret Key")
        self.inp_ocr_secret.setEchoMode(QLineEdit.Password)
        af.addRow("OCR Secret:", self.inp_ocr_secret)

        self.inp_qwen_key = QLineEdit(self.config.get("qwen_vl_api_key", ""))
        self.inp_qwen_key.setPlaceholderText("通义千问 API Key")
        self.inp_qwen_key.setEchoMode(QLineEdit.Password)
        af.addRow("通义千问 VL:", self.inp_qwen_key)

        self.inp_doubao_key = QLineEdit(self.config.get("doubao_api_key", ""))
        self.inp_doubao_key.setPlaceholderText("豆包 API Key")
        self.inp_doubao_key.setEchoMode(QLineEdit.Password)
        af.addRow("豆包 LLM:", self.inp_doubao_key)

        self.inp_doubao_model = QLineEdit(self.config.get("doubao_model_id", ""))
        self.inp_doubao_model.setPlaceholderText("豆包模型 ID（如 doubao-pro-32k）")
        af.addRow("豆包模型:", self.inp_doubao_model)

        grp_api.setLayout(af)
        layout.addWidget(grp_api)

        # ── 提示 ──
        tip = QLabel(
            "💡 没有 API Key？白泽会使用内置基础词库工作。\n"
            "    配置 API 后可解锁全屏幕内容识别和智能翻译。")
        tip.setStyleSheet("color: #888; font-size: 11px; padding: 4px;")
        tip.setWordWrap(True)
        layout.addWidget(tip)

        layout.addStretch()

        # ── 保存按钮 ──
        btn_save = QPushButton("💾 保存设置")
        btn_save.setFixedHeight(40)
        btn_save.setStyleSheet("""
            QPushButton {
                background: #1976d2; color: white; border: none;
                border-radius: 6px; font-size: 14px; font-weight: bold;
            }
            QPushButton:hover { background: #1565c0; }
        """)
        btn_save.clicked.connect(self._save)
        layout.addWidget(btn_save)

    def _save(self):
        gender_map = {0: "unknown", 1: "male", 2: "female"}
        self.config.update({
            "capture_interval": self.spn_interval.value(),
            "user_age": self.spn_age.value(),
            "user_gender": gender_map.get(self.cmb_gender.currentIndex(), "unknown"),
            "bubble_duration": self.spn_bubble.value() * 1000,
            "baidu_ocr_api_key": self.inp_ocr_key.text().strip(),
            "baidu_ocr_secret_key": self.inp_ocr_secret.text().strip(),
            "qwen_vl_api_key": self.inp_qwen_key.text().strip(),
            "doubao_api_key": self.inp_doubao_key.text().strip(),
            "doubao_model_id": self.inp_doubao_model.text().strip(),
        })
        save_config(self.config)
        QMessageBox.information(self, "✅ 保存成功",
                                "设置已保存！\n部分设置需要重启应用后生效。")
        self.accept()
