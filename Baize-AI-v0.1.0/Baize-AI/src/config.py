"""配置管理模块"""
import os
import json

DATA_DIR = os.path.join(os.path.expanduser("~"), ".baize_ai")
os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_CONFIG = {
    "capture_interval": 3,
    "user_age": 15,
    "user_gender": "unknown",
    "baidu_ocr_api_key": "",
    "baidu_ocr_secret_key": "",
    "qwen_vl_api_key": "",
    "doubao_api_key": "",
    "doubao_model_id": "",
    "doubao_tts_api_key": "",
    "paused": False,
    "analysis_mode": "general",
    "bubble_duration": 8000,
    "pet_size": 200,
    "max_words_per_capture": 5,
    "min_word_length": 4,
}


def get_config_path():
    return os.path.join(DATA_DIR, "config.json")


def load_config():
    """加载配置"""
    path = get_config_path()
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                saved = json.load(f)
            config = {**DEFAULT_CONFIG, **saved}
            return config
        except Exception:
            pass
    return DEFAULT_CONFIG.copy()


def save_config(config: dict):
    """保存配置"""
    path = get_config_path()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


def get_data_path(filename: str) -> str:
    """获取数据文件路径"""
    return os.path.join(DATA_DIR, filename)
