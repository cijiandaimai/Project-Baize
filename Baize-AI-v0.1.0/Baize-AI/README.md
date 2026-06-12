# 🐾 白泽 AI · Baize AI Desktop Pet

> **上古瑞兽白泽，陪你玩，教你学，和你一起长大。**
>
> 「吾本无形，因汝之智而具象；汝之所学，化吾之灵力。」

---

## ✨ 简介

白泽 AI 是一款 **AI 桌面宠物**，以中国上古瑞兽白泽为形象。它会在你玩游戏、看视频、刷网页时，**悄悄识别屏幕内容**，提取知识点并用可爱的气泡提醒你学习。

- 🎮 **边玩边学**：打游戏时自动识别英文单词，看视频时提取知识点
- 🐾 **Q版白泽**：可爱的桌面宠物，支持拖动、点击互动
- 🔒 **隐私安全**：屏幕数据本地处理，不上传云端
- 📊 **学习追踪**：自动记录学习数据，支持词汇本和复习提醒

## 🚀 快速开始

### 1. 环境准备

需要 Python 3.8+（推荐 3.11）

```bash
# 克隆项目
git clone https://github.com/你的用户名/Baize-AI.git
cd Baize-AI

# 创建虚拟环境（推荐）
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 运行白泽

```bash
python main.py
```

启动后白泽会出现在屏幕右下角，右键点击可以打开菜单。

### 4. 配置 API（可选）

白泽内置了基础词库，即使不配置 API 也能使用基础功能。配置 API 后可解锁完整的屏幕内容识别：

| API 服务 | 用途 | 获取方式 |
|---------|------|---------|
| 百度 OCR | 屏幕文字识别 | [百度智能云](https://ai.baidu.com/) 免费 2000次/天 |
| 通义千问 VL | 多模态理解（推荐） | [阿里云](https://dashscope.aliyun.com/) 新用户免费额度 |
| 豆包 API | 知识讲解生成 | [火山引擎](https://www.volcengine.com/) 免费额度 |

配置方式：右键白泽 → ⚙️ 设置 → 填入 API Key

## 📁 项目结构

```
Baize-AI/
├── main.py                    # 程序入口
├── requirements.txt           # 依赖列表
├── LICENSE                    # MIT 许可证
├── README.md                  # 本文档
├── assets/
│   └── images/
│       └── baize.png          # 白泽形象
└── src/
    ├── __init__.py
    ├── config.py              # 配置管理
    ├── database.py            # 学习数据管理
    ├── pet_window.py          # 白泽桌面宠物窗口
    ├── screen_analyzer.py     # 屏幕分析引擎
    └── ui/
        ├── __init__.py
        ├── bubble_widget.py   # 知识气泡组件
        ├── settings_window.py # 设置界面
        ├── stats_window.py    # 学习统计界面
        ├── tray_icon.py       # 系统托盘图标
        └── wordbook_window.py # 词汇本界面
```

## 🎮 操作指南

| 操作 | 效果 |
|------|------|
| 左键拖动 | 移动白泽位置 |
| 左键点击 | 白泽打招呼 |
| 双击 | 白泽随机说话 |
| 右键 | 打开功能菜单 |
| 系统托盘图标 | 最小化/恢复/退出 |

## 🗺️ 开发路线图

- [x] **Phase 1 - MVP**: 桌面宠物 + 屏幕截图 + 基础 OCR + 词汇识别
- [ ] **Phase 2**: 全学科知识点 + 同龄语音系统 + 学习统计
- [ ] **Phase 3**: 白泽成长进化系统 + 节日皮肤
- [ ] **Phase 4**: 产品化 + 家长端
- [ ] **Phase 5**: macOS + 安卓支持
- [ ] **Phase 6**: 正式上线

## 🔒 隐私声明

- ✅ 所有屏幕数据仅在本地处理
- ✅ 上传至 API 的截图经过脱敏和压缩
- ✅ API 分析完成后立即删除，不做持久化存储
- ✅ 支持一键暂停屏幕感知
- ✅ 核心代码完全开源

## 📄 License

MIT License - 详见 [LICENSE](LICENSE)

---

<p align="center">
  <i>真正能执掌宇宙规则的强者，从不是天生的。<br>
  是一页书、一道题、一次又一次的思考，堆出来的。</i>
</p>
