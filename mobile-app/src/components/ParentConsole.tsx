import React, { useState } from "react";
import { Lock, Unlock, Shield, Eye, Settings, Bell, Timer, Sliders, Volume2, Save, Trash2, ShieldCheck } from "lucide-react";
import { type ParentConfig } from "../types";
import { motion } from "motion/react";

interface ParentConsoleProps {
  config: ParentConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParentConfig>>;
}

export default function ParentConsole({ config, setConfig }: ParentConsoleProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  
  // Temporary inputs in unlocked panel
  const [timeLimit, setTimeLimit] = useState(config.dailyLimitMs / 60000); // in minutes
  const [announcement, setAnnouncement] = useState(config.announcementText);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [subjectsConfig, setSubjectsConfig] = useState({
    biology: true,
    math: true,
    physics: true,
    chemistry: true,
    history: true,
    others: true,
  });

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === config.parentPin) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
      setTimeout(() => setPinError(false), 800);
    }
  };

  const handleSave = () => {
    setConfig((prev) => ({
      ...prev,
      dailyLimitMs: timeLimit * 60000,
      announcementText: announcement,
      announcementActive: announcement.trim().length > 0,
    }));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  const clearAnnouncement = () => {
    setAnnouncement("");
    setConfig((prev) => ({
      ...prev,
      announcementText: "",
      announcementActive: false,
    }));
  };

  if (!isAuthenticated && config.isLockEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-slate-100 p-6 space-y-6">
        <div className="w-14 h-14 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-500 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>
        
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold tracking-tight text-slate-200">白泽·家长守护控制台</h3>
          <p className="text-[10px] text-slate-400">请输入家长专属4位验证PIN码，以调整限额及亲子信箱</p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4 w-full max-w-[240px]">
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            className={`w-full py-2.5 text-center text-lg tracking-widest font-mono rounded-lg bg-slate-800 border outline-none transition-all ${
              pinError
                ? "border-red-500 bg-red-950/20 text-red-500 animate-bounce"
                : "border-slate-700 text-slate-100 focus:border-cyan-500"
            }`}
          />
          
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => pinInput.length < 4 && setPinInput((p) => p + num)}
                className="py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold active:scale-95 transition-all text-slate-300 font-mono"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPinInput("")}
              className="py-2 col-span-1 bg-slate-900 border border-slate-800/80 rounded-lg text-[10px] font-bold text-slate-500"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => pinInput.length < 4 && setPinInput((p) => p + "0")}
              className="py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold font-mono text-slate-300"
            >
              0
            </button>
            <button
              type="submit"
              className="py-2 text-[10px] bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-bold"
            >
              验证
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center font-mono">（离线默认初始化PIN：1234）</p>
        </form>
      </div>
    );
  }

  const durationPercentage = Math.min(100, Math.floor((config.usedTimeMs / config.dailyLimitMs) * 100));

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pwa-safebottom select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200">家长守护控制台（已解锁）</h3>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-2 py-1 text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded text-slate-400 transition"
        >
          安全锁屏
        </button>
      </div>

      {/* Screen Time Usage visual indicator */}
      <div className="bg-slate-800 border border-slate-700/60 p-3 rounded-xl space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span>智能屏幕时间限度 (今日已游玩)</span>
          </span>
          <span className="font-mono">
            {Math.floor(config.usedTimeMs / 60000)}m / {timeLimit}m
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              durationPercentage >= 90 ? "bg-red-500" : durationPercentage >= 70 ? "bg-amber-500" : "bg-cyan-500"
            }`}
            style={{ width: `${durationPercentage}%` }}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={10}
            max={180}
            step={5}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="flex-1 accent-cyan-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-cyan-300 w-12 text-right">{timeLimit}分钟</span>
        </div>
      </div>

      {/* Parental announcements (亲子信箱) */}
      <div className="bg-slate-800 border border-slate-700/60 p-3 rounded-xl space-y-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
          <Bell className="w-4 h-4 text-rose-400" />
          <span>亲子飞信信箱（由白泽随时在桌面转述口播）</span>
        </div>
        <p className="text-[10px] text-slate-400">
          在此输入叮嘱内容，白泽将在孩子进行模拟游戏/浏览大屏的敏感时机自动口头转述，代替生硬的说教。
        </p>
        <div className="space-y-1.5">
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            maxLength={100}
            rows={2}
            placeholder="小主人，妈妈看你研究红石电路好久啦，站起来晃晃脖子、喝口温水噢~"
            className="w-full p-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
          />
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-mono">最多 100 字</span>
            <div className="flex items-center gap-1">
              <button
                onClick={clearAnnouncement}
                className="p-1 px-2 text-red-400 hover:bg-slate-700 rounded flex items-center gap-1"
                title="清空公告"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content curation filter settings */}
      <div className="bg-slate-800 border border-slate-700/60 p-3 rounded-xl space-y-2 px-3.5 shadow-sm">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-1">
          <Sliders className="w-4 h-4 text-teal-400" />
          <span>学科方向与屏蔽范围定制</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center gap-2 p-2 rounded bg-slate-900 cursor-pointer text-slate-300 hover:bg-slate-700/40">
            <input
              type="checkbox"
              checked={subjectsConfig.biology}
              onChange={(e) => setSubjectsConfig((prev) => ({ ...prev, biology: e.target.checked }))}
              className="accent-cyan-500"
            />
            <span>生物核心探究</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded bg-slate-900 cursor-pointer text-slate-300 hover:bg-slate-700/40">
            <input
              type="checkbox"
              checked={subjectsConfig.math}
              onChange={(e) => setSubjectsConfig((prev) => ({ ...prev, math: e.target.checked }))}
              className="accent-cyan-500"
            />
            <span>数学公式原理</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded bg-slate-900 cursor-pointer text-slate-300 hover:bg-slate-700/40">
            <input
              type="checkbox"
              checked={subjectsConfig.physics}
              onChange={(e) => setSubjectsConfig((prev) => ({ ...prev, physics: e.target.checked }))}
              className="accent-cyan-500"
            />
            <span>物理电磁机理</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded bg-slate-900 cursor-pointer text-slate-300 hover:bg-slate-700/40">
            <input
              type="checkbox"
              checked={subjectsConfig.chemistry}
              onChange={(e) => setSubjectsConfig((prev) => ({ ...prev, chemistry: e.target.checked }))}
              className="accent-cyan-500"
            />
            <span>化学分子演化</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded bg-slate-900 cursor-pointer text-slate-300 hover:bg-slate-700/40">
            <input
              type="checkbox"
              checked={subjectsConfig.history}
              onChange={(e) => setSubjectsConfig((prev) => ({ ...prev, history: e.target.checked }))}
              className="accent-cyan-500"
            />
            <span>历史人文考证</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded bg-slate-900 cursor-pointer text-slate-300 hover:bg-slate-700/40">
            <input
              type="checkbox"
              checked={subjectsConfig.others}
              onChange={(e) => setSubjectsConfig((prev) => ({ ...prev, others: e.target.checked }))}
              className="accent-cyan-500"
            />
            <span>其他学科(附加)</span>
          </label>
        </div>
        <p className="text-[9px] text-slate-500 italic mt-1.5 text-center">所有大屏提取数据本地去隐私存储，百分百保护安全隐私。</p>
      </div>

      {/* Saved success inline feedback banner */}
      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-lg text-center font-semibold"
        >
          ✓ 家长守护配置已保存，实时应用生效！
        </motion.div>
      )}

      {/* Trigger save */}
      <button
        onClick={handleSave}
        className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 hover:shadow-cyan-600/10 hover:shadow-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
      >
        <Save className="w-4 h-4" />
        <span>保 存 并 应 用 指 标</span>
      </button>
    </div>
  );
}
