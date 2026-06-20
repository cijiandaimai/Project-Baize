import React from "react";
import { Copy, Terminal, Smartphone, Activity, Download, Settings, Github, AppWindow } from "lucide-react";

export default function ApkDeploymentHub() {
  const codeCapacitorConfig = `{
  "appId": "com.baize.desktop.pet",
  "appName": "白泽灵启纪元",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  }
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("代码已复制到剪贴板！");
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pwa-safebottom select-none">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-slate-200">安卓端 Native 打包与部署中心</h3>
        <p className="text-[10px] text-slate-400">结合 Capacitor 工业级全套方案，直接将本项目编译为原生安卓 APK 文件</p>
      </div>

      {/* Deployment Option 1: PWA */}
      <div className="bg-slate-800/90 border border-slate-700/60 p-3.5 rounded-xl space-y-2 shadow-sm">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-4.5 h-4.5 text-emerald-400" />
          <h4 className="text-xs font-bold text-slate-200">方案一：免编译一键安装 Android PWA 网页应用</h4>
        </div>
        <p className="text-[10px] text-slate-300 leading-relaxed">
          本项目已经在 Vite 中进行了高集成适配。你可以直接使用 Android 系统自带的 **Chrome 浏览器** 或极速浏览器打开本服务网页，点击浏览器菜单栏中的 
          <strong className="text-cyan-400">“添加到主屏幕” (Add to Home Screen)</strong> 即可生成专属桌面 App 快捷图标。
        </p>
        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 space-y-1">
          <p>✔️ 支持全屏沉浸（自动隐藏导航栏，模拟全原生软件）</p>
          <p>✔️ 启动时自动建立独立窗口（不与普通浏览器网页混淆）</p>
          <p>✔️ 运行功耗低，性能极流畅（极佳折中策略）</p>
        </div>
      </div>

      {/* Deployment Option 2: Capacitor Native Container */}
      <div className="bg-slate-800/90 border border-slate-700/60 p-3.5 rounded-xl space-y-3.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-4.5 h-4.5 text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-200">方案二：使用 Capacitor 编译原生 Android .APK</h4>
        </div>
        <p className="text-[10px] text-slate-300">
          通过在根目录执行以下终端指令，可轻松将本项目代码转化为 Gradle 安卓原生工程项目，并在 Android Studio 中导出最终 APK 软件：
        </p>

        {/* Console Codes */}
        <div className="space-y-2">
          <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-[9px] relative group text-cyan-400/95 border border-slate-800">
            <button
              onClick={() => copyToClipboard("npm run build && npx cap init && npm i @capacitor/android && npx cap add android && npx cap sync android")}
              className="absolute right-2 top-2 p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-400 transition"
              title="复制代码"
            >
              <Copy className="w-3 h-3" />
            </button>
            <p className="text-slate-500 mb-1"># 1. 编译并初始化 Android 原生模板</p>
            <p className="whitespace-pre-wrap select-all">npm run build</p>
            <p className="whitespace-pre-wrap select-all">npm i @capacitor/core @capacitor/cli @capacitor/android</p>
            <p className="whitespace-pre-wrap select-all">npx cap init</p>
            <p className="whitespace-pre-wrap select-all">npx cap add android</p>
            <p className="whitespace-pre-wrap select-all">npx cap sync android</p>
          </div>

          <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-[9px] relative group text-cyan-400/95 border border-slate-800">
            <button
              onClick={() => copyToClipboard("npx cap open android")}
              className="absolute right-2 top-2 p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-400 transition"
              title="复制代码"
            >
              <Copy className="w-3 h-3" />
            </button>
            <p className="text-slate-500 mb-1"># 2. 调用 Android Studio 将代码编译为 APK 实机运行</p>
            <p className="whitespace-pre-wrap select-all">npx cap open android</p>
          </div>
        </div>

        {/* Config box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
            <span>必备配置文件：capacitor.config.json</span>
            <button
              onClick={() => copyToClipboard(codeCapacitorConfig)}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>复制配置文件</span>
            </button>
          </div>
          <pre className="p-2.5 roundedbg rounded-lg bg-slate-950 text-[9px] text-slate-400 font-mono overflow-x-auto border border-slate-800">
            {codeCapacitorConfig}
          </pre>
        </div>
      </div>

      {/* Senior Android Floating Window Overlay Guide */}
      <div className="bg-slate-800/95 border border-slate-700/60 p-3.5 rounded-xl space-y-2 text-xs shadow-sm">
        <div className="flex items-center gap-1.5">
          <AppWindow className="w-4.5 h-4.5 text-rose-400" />
          <h4 className="text-xs font-bold text-slate-200">安卓深层高级机制：桌面悬浮窗 + 屏幕截图抓取</h4>
        </div>
        <p className="text-[10px] text-slate-300 leading-relaxed">
          要实现在真正的手机游戏（如王者、原神）上方像宠物一样漂浮，并实时感知手机背景屏幕：
        </p>

        <div className="space-y-1.5 pl-2 text-[10px] text-slate-400">
          <p>
            1. **悬浮窗权限 (System Alert Window)**:
            需要在原生安卓工程中，修改 <code className="text-cyan-400">AndroidManifest.xml</code>，并使用 Service 构建：
            <br />
            <code className="text-slate-500 font-mono">&lt;uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/&gt;</code>
          </p>
          <p>
            2. **多模态屏幕感知 (MediaProjection)**:
            需要请求安卓系统的媒体截屏服务，并在后台定时截取画面传递给内置多模态大模型进行高精分析：
            <br />
            <code className="text-slate-500 font-mono">val mediaProjectionManager = getSystemService(MEDIA_PROJECTION_SERVICE)</code>
          </p>
        </div>
        <div className="pt-1.5 border-t border-slate-700/60 text-center flex justify-center">
          <a
            href="https://github.com/cijiandaimai/Project-Baize"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
          >
            <Github className="w-4 h-4" />
            <span>访问 [此间代码] Project-Baize 开源库</span>
          </a>
        </div>
      </div>
    </div>
  );
}
