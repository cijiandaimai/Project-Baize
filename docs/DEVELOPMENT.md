# 开发与打包说明

## 本地开发

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe main.py
```

## 测试

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

当前测试覆盖：

- 基础资源是否存在
- 桌宠窗口是否透明、置顶、无边框
- `idle` 动画帧是否加载并循环
- “悟道 / 讲道”状态切换
- 状态栏靠近屏幕边缘时不会越界
- 运行时代码不包含截图或网络模块

## 打包

```powershell
.\.venv\Scripts\pyinstaller.exe --noconfirm --clean --onefile --windowed --name "BaizeDesktopPet-idle" --add-data "assets\images\baize-idle-v11.png;assets\images" --add-data "assets\animations\idle;assets\animations\idle" main.py
```

打包完成后，EXE 位于 `dist/BaizeDesktopPet-idle.exe`。

`dist/`、`build/` 和 `*.spec` 属于生成产物，不提交到 GitHub。

## 当前安全边界

当前版本不包含：

- 屏幕截图
- OCR
- 云端 API
- 本地数据库
- 用户数据收集

后续接入感知能力时，必须继续遵循“默认悟道模式关闭感知、用户显式切换讲道后才启用”的原则。
