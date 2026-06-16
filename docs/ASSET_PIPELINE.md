# 动画素材流程

## 当前素材

- 主静态图：`assets/images/baize-idle-v11.png`
- 双山羊角参考图：`assets/images/baize-idle-v7-reference.png`
- 待机动画帧：`assets/animations/idle/frame_000.png` 到 `frame_060.png`
- 动画元数据：`assets/animations/idle/metadata.json`

## 从视频生成待机动画

项目提供转换脚本：

```powershell
.\.venv\Scripts\python.exe .\tools\build_idle_animation.py "D:\11\baize\形象视频1.mp4" --out ".\assets\animations\idle" --fps 12 --size 220
```

脚本会：

- 从视频抽帧
- 根据边角估算纯色背景
- 把背景转成透明通道
- 裁剪角色主体
- 输出 220 x 220 的 PNG 帧序列

## 为什么不用 GIF

GIF 色彩少，透明边缘容易脏。白泽有大量白色毛发和浅蓝描边，更适合使用 PNG 帧序列。

## 为什么不直接播放 MP4

MP4 通常没有透明通道，直接播放会出现方形视频背景。透明 PNG 帧更适合桌面宠物。
