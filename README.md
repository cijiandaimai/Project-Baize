# 白泽桌面宠物

一个安全、离线、可运行的 Windows 桌面宠物最小版本。

## 当前状态

当前版本专注验证桌面宠物基础体验：

- 透明、无边框、始终置顶
- 鼠标拖动
- 循环播放 `idle` 待机动画
- 单击白泽显示头顶模式栏
- “悟道”关闭截图与截图分析
- “讲道”开启全部功能
- 右键打开“关于”和“退出”菜单
- 不截屏、不联网、不调用 API
- 不收集、不保存用户数据

本阶段有意不包含实际的屏幕感知、OCR、AI 对话、语音、数据库和家长端。“讲道”目前是统一的功能开启状态，后续截图和分析模块接入时会遵循这个开关。

## 环境要求

- Windows 10 或 Windows 11
- Python 3.10 或更高版本

## 首次安装

在项目目录打开 PowerShell：

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## 运行

```powershell
.\.venv\Scripts\python.exe main.py
```

白泽会出现在桌面右下角。拖动可以改变位置，单击会显示“悟道 / 讲道”模式栏，右键可以查看版本或退出。

## 打包 EXE

```powershell
.\.venv\Scripts\pyinstaller.exe --noconfirm --clean --onefile --windowed --name "BaizeDesktopPet-idle" --add-data "assets\images\baize-idle-v11.png;assets\images" --add-data "assets\animations\idle;assets\animations\idle" main.py
```

生成文件位于 `dist/`。打包产物不提交到 GitHub。

## 测试

```powershell
.\.venv\Scripts\python.exe -m pytest
```

## 项目结构

```text
Project-Baize/
├── assets/images/baize-idle-v11.png
├── assets/animations/idle/
├── docs/CHARACTER_DESIGN.md
├── src/
│   ├── app.py
│   ├── bubble.py
│   └── pet_window.py
├── tests/
├── tools/
├── main.py
├── requirements.txt
└── README.md
```

## 文档

- [角色设计规范](docs/CHARACTER_DESIGN.md)
- [开发与打包说明](docs/DEVELOPMENT.md)
- [动画素材流程](docs/ASSET_PIPELINE.md)
- [早期方案文档](docs/planning/)

## 隐私承诺

当前版本完全离线运行，不读取屏幕内容，不访问网络，也不创建用户画像或学习记录。

## License

GPL-3.0，详见 [LICENSE](LICENSE)。
