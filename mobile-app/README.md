# 白泽 AI 桌面宠物 - 手机端 MVP

这是白泽桌面宠物的手机端原型。当前是 React/Vite + 本地服务 + PWA + Capacitor Android 工程。

## 已完成

- 沿用桌面端最终白泽形象：白色、双山羊角、金色装饰、蓝色宝石。
- 悟道模式：安静陪伴，关闭截图与分析入口。
- 讲道模式：开启灵光感知、讲解和学习卡片。
- 问白泽：没有 Key 时本地离线回复；配置免费额度 API Key 后，自动按队列调用 Groq / Gemini / NVIDIA / GitHub Models / OpenRouter。
- 画面场景：支持 Minecraft 红石、李白角色、植物视频、火山视频，也支持自定义描述。
- 学习卡片：灵光感知生成卡片，并保存到浏览器本地。
- 守护设置：每日使用时长、安静提醒、家长提醒语。
- PWA 基础：manifest、图标、service worker 离线缓存。
- Android 工程：已通过 Capacitor 生成。

## 本地运行

```powershell
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

## 开启真实 AI

复制 `.env.example` 为 `.env`，把你申请到的平台 Key 填进去。可以只填一个，白泽会自动使用第一个可用平台；失败时会继续尝试下一个，最后回到本地离线回复。

```env
AI_PROVIDER_ORDER="groq,gemini,nvidia,github,openrouter"

GROQ_API_KEY="你的 Groq Key"
GROQ_MODEL="llama-3.3-70b-versatile"

GEMINI_API_KEY="你的 Key"
GEMINI_MODEL="gemini-2.0-flash"

NVIDIA_API_KEY="你的 NVIDIA Key"
GITHUB_MODELS_API_KEY="你的 GitHub Models Key"
OPENROUTER_API_KEY="你的 OpenRouter Key"
```

不配置 Key 时，项目会自动保持本地离线演示模式。

不要把真实 API Key 写进前端代码、APK 或提交到 GitHub。真实 Key 只放本机 `.env` 或后端服务器环境变量里。

## 检查与构建

```powershell
npm run lint
npm run build
npm run start
```

## Android APK

为了避免占用 C 盘，Android SDK 请安装到：

```text
D:\11\baize\android-sdk
```

详细步骤见：

```text
ANDROID_BUILD.md
```
