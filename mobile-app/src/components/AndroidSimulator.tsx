import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Battery,
  Wifi,
  Compass,
  MessageSquare,
  BookMarked,
  ShieldAlert,
  Sliders,
  Sparkles,
  Search,
  Maximize,
  Volume2,
  Lock,
  ChevronRight,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import {
  type CompanionState,
  type LearningContext,
  type VocabularyItem,
  type ScreenInsight,
  type ParentConfig
} from "../types";
import BaizePet from "./BaizePet";
import BaizeChat from "./BaizeChat";
import StudyNotebook from "./StudyNotebook";
import ParentConsole from "./ParentConsole";
import ApkDeploymentHub from "./ApkDeploymentHub";
import { motion, AnimatePresence } from "motion/react";

// Preconfigured mobile screens for full interactive simulation
const SIMULATED_APPS: LearningContext[] = [
  {
    id: "app_launcher",
    title: "Android 灵启桌面 (Homescreen)",
    category: "idle",
    appName: "白泽星寰桌面",
    subType: "系统",
    scantext: "白泽 灵启 纪元 伴读 探索",
    screenStateDesc: "安卓星寰主壁纸，包含各种学科学习快捷键，处于空闲交互态。",
    mockScreenshotUrl: "bg-gradient-to-tr from-slate-950 via-slate-900 to-cyan-950",
  },
  {
    id: "moba_game",
    title: "《王者荣耀》- 武将李白与诗仙考证",
    category: "game",
    appName: "王者荣耀",
    subType: "历史",
    scantext: "将进酒，杯莫停！大唐永王起兵案与贬谪李白流放夜郎历史真相。",
    screenStateDesc: "正在战场中操纵刺客李白，技能发动时屏幕上闪现著名诗句，引发瑞兽白泽对安史之乱中永王兵败并导致李白最终被流放的历史事件考证。",
    mockScreenshotUrl: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop')",
  },
  {
    id: "minecraft_redstone",
    title: "《我的世界》- 红石非门电工逻辑",
    category: "game",
    appName: "Minecraft",
    subType: "物理",
    scantext: "Repeater Pulse NOT-Gate. 一阶电学逻辑控制。",
    screenStateDesc: "红石电路设计，通过拉杆电信号以及红石火把。利用数字集成电路‘非门(NOT Gate)’，让荧石路灯在夜晚无信号状态下依然强电荷通电，自动亮起。",
    mockScreenshotUrl: "url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1200&auto=format&fit=crop')",
  },
  {
    id: "genshin_biology",
    title: "《原神》- 须弥草木与光合作用",
    category: "game",
    appName: "原神 (须弥草元)",
    subType: "生物",
    scantext: "Photosynthesis. Chloroplast. 植物叶绿体在日光下裂解水分子并生成纯氧气。",
    screenStateDesc: "草木繁茂环境。微观上，植物细胞叶肉层中数以亿计的‘叶绿体(Chloroplast)’正在叶绿素光合作用下，裂解水、放出长生不息的氧气生命之源。",
    mockScreenshotUrl: "url('https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=1200&auto=format&fit=crop')",
  },
  {
    id: "volcano_video",
    title: "《火山喷发》- 二氧化硫中和反应",
    category: "video",
    appName: "火山大爆发科普视频",
    subType: "化学",
    scantext: "SO2 gas magma aerosol effect. Acid rain neutralization with alkaline.",
    screenStateDesc: "屏幕中岩浆滚涌。旁白介绍，火山高热喷出的二氧化硫气体与水反应结合，而人类化学实验室常通过酸碱中和手段，用氢氧化钠（NaOH）除去酸性有害气体的微观分子置换过程。",
    mockScreenshotUrl: "url('https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop')",
  },
  {
    id: "math_calculator",
    title: "《几何函数》- 笛卡尔坐标与切线极值",
    category: "book",
    appName: "几何坐标计算器",
    subType: "数学",
    scantext: "Cartesian coordinates formula. 求解曲率高阶导数及受力支轴极值点。",
    screenStateDesc: "正在分析直角坐标曲线方程。通过解析几何创始人笛卡尔坐标系，将完美的几何图形转换为代数方程，利用切线导数，破解桥拱、火炮或航行轨道的最佳受力物理节点。",
    mockScreenshotUrl: "url('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop')",
  },
  {
    id: "duolingo_english",
    title: "《多邻国》- 流星Meteor英语词源考",
    category: "book",
    appName: "English Duolingo",
    subType: "其他(附加)",
    scantext: "Meteor Fireball. The legendary wizard spells meteor showers.",
    screenStateDesc: "一道填空题，考证流星 Meteor 源自古希腊词 ‘meteoros’ 悬空跳舞的物理奇观。掌握附加的多门外语工具，能助力未来的你顺畅阅读全球一流科学学术文献。",
    mockScreenshotUrl: "url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200&auto=format&fit=crop')",
  },
];

export default function AndroidSimulator() {
  // Companion Core States
  const [companion, setCompanion] = useState<CompanionState>({
    age: "10-12",
    level: 1,
    exp: 20,
    maxExp: 100,
    unlockedForms: ["小白泽"],
    currentForm: "小白泽",
    name: "白泽",
    petName: "灵明白泽",
    mood: "idle",
  });

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([
    {
      id: "init_v1",
      word: "Fireball",
      phonetic: "ˈfaɪərbɔːl",
      translation: "n. 火球；火球术",
      definition: "A ball of fire or a sphere of extremely hot gas.",
      example: "The legendary wizard cast a powerful fireball.",
      exampleTranslation: "传奇法师释放了一个威力巨大的火球术。",
      sourceGame: "多邻国英语",
      mastered: false,
      createdAt: new Date().toISOString(),
      levelRequired: 1,
    },
  ]);

  const [insights, setInsights] = useState<ScreenInsight[]>([
    {
      id: "init_i1",
      title: "红石电路本质与非运算",
      content: "《我的世界》中的红石火把其实就是数字电路里的非门（NOT Gate）。输入高能量时输出变为零，从而可以实现复杂的机械联动控制。学懂这个，你甚至已经掌握了部分数字芯片的核心物理逻辑呢！",
      subject: "物理",
      pointsReward: 15,
      timestamp: "10:30"
    }
  ]);

  // View state controller inside the phone:
  // "home" (Desktop with overlay pet), "chat" (Companion Chat), "notebook" (Books), "parent" (Parent settings), "apk" (Deployment)
  const [activeScreen, setActiveScreen] = useState<"home" | "chat" | "notebook" | "parent" | "apk">("home");
  
  // Active simulated mobile application running on homescreen
  const [activeAppIdx, setActiveAppIdx] = useState(0);
  const currentApp = SIMULATED_APPS[activeAppIdx];

  // Screen Scanning Animation Trigger
  const [isScanning, setIsScanning] = useState(false);
  
  // Current popup insight card from scan
  const [activeInsight, setActiveInsight] = useState<any | null>(null);

  // Parental Locks Setup
  const [parentConfig, setParentConfig] = useState<ParentConfig>({
    dailyLimitMs: 60 * 60 * 1000, // 60 minutes
    usedTimeMs: 12 * 60 * 1000, // 12 minutes
    parentPin: "1234",
    isLockEnabled: true,
    announcementText: "小主人，妈妈在家长端看到你对物理公式很有专长！晚饭前休息10分钟，揉揉眼睛喔！",
    announcementActive: true,
  });

  // Level progression helper
  const addExp = (amount: number) => {
    setCompanion((prev) => {
      let newExp = prev.exp + amount;
      let newLvl = prev.level;
      let newMax = prev.maxExp;
      const evolvedForms = [...prev.unlockedForms];

      while (newExp >= newMax) {
        newExp -= newMax;
        newLvl += 1;
        newMax = Math.floor(newMax * 1.3) + 20;

        // Form Evolution milestones
        if (newLvl === 10 && !evolvedForms.includes("灵明白泽")) {
          evolvedForms.push("灵明白泽");
        } else if (newLvl === 20 && !evolvedForms.includes("通慧白泽")) {
          evolvedForms.push("通慧白泽");
        } else if (newLvl === 30 && !evolvedForms.includes("全知白泽")) {
          evolvedForms.push("全知白泽");
        } else if (newLvl === 50 && !evolvedForms.includes("瑞兽白泽")) {
          evolvedForms.push("瑞兽白泽");
        }
      }

      // Check corresponding name
      let formName = "小白泽";
      if (newLvl >= 50) formName = "瑞兽白泽";
      else if (newLvl >= 30) formName = "全知白泽";
      else if (newLvl >= 20) formName = "通慧白泽";
      else if (newLvl >= 10) formName = "灵明白泽";

      return {
        ...prev,
        level: newLvl,
        exp: newExp,
        maxExp: newMax,
        unlockedForms: evolvedForms,
        currentForm: formName,
        petName: formName,
      };
    });
  };

  const getFormNameByLevel = (lvl: number) => {
    if (lvl >= 50) return "瑞兽白泽 (最终阶)";
    if (lvl >= 30) return "全知白泽 (第四阶)";
    if (lvl >= 20) return "通慧白泽 (第三阶)";
    if (lvl >= 10) return "灵明白泽 (第二阶)";
    return "小白泽 (初始阶)";
  };

  // Perform "Perceive Screen (一键灵光感知)" - simulated OCR + Gemini call
  const triggerScreenScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setCompanion((prev) => ({ ...prev, mood: "thinking" }));

    try {
      const res = await fetch("/api/baize/perceive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            appName: currentApp.appName,
            category: currentApp.category,
            screenStateDesc: currentApp.screenStateDesc,
            scantext: currentApp.scantext,
          },
          age: companion.age,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Trigger screen scan success popup card
        setActiveInsight({
          title: data.title,
          content: data.content,
          subject: data.subject || "其他(附加)",
          pointsReward: data.pointsReward || 15,
          baizeComment: data.baizeComment || "哇！看到了非常高维的万物真理碎片呢！",
        });

        // Add this to our study insights
        const newInsight: ScreenInsight = {
          id: Date.now().toString(),
          title: data.title,
          content: data.content,
          subject: data.subject || "其他(附加)",
          pointsReward: data.pointsReward || 15,
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
        };
        setInsights((prev) => [newInsight, ...prev]);

        // Add English words if on English page Duolingo
        if (currentApp.appName === "English Duolingo") {
          const hasWord = vocabulary.some(w => w.word.toLowerCase() === "fireball");
          if (!hasWord) {
            setVocabulary((prev) => [
              {
                id: Date.now().toString(),
                word: "Fireball",
                phonetic: "ˈfaɪərbɔːl",
                translation: "n. 火球（术）；炽热恒星",
                definition: "A ball of fire, typically extremely hot and radiant.",
                example: "The fire wizard summoned an enormous fireball.",
                exampleTranslation: "烈火巫师召唤了一个极其庞大的火球。",
                sourceGame: "多邻国英语",
                mastered: false,
                createdAt: new Date().toISOString(),
                levelRequired: 1,
              },
              ...prev
            ]);
          }
        } else if (currentApp.appName === "王者荣耀") {
          // Add some history vocabulary as fun
          const hasPoem = vocabulary.some(w => w.word === "Meteor");
          if (!hasPoem) {
            setVocabulary((prev) => [
              {
                id: Date.now().toString(),
                word: "Meteor",
                phonetic: "ˈmiːtiər",
                translation: "n. 流星；大气现象",
                definition: "A small body of matter from outer space that enters the earth's atmosphere.",
                example: "The silver horse ran swifter than a meteor.",
                exampleTranslation: "银鞍白马奔驰得比流星还要迅捷。",
                sourceGame: "王者荣耀李白",
                mastered: false,
                createdAt: new Date().toISOString(),
                levelRequired: 1,
              },
              ...prev
            ]);
          }
        }

        // Voice speech synthesis read aloud
        try {
          window.speechSynthesis.cancel();
          const readText = `识见点亮：${data.title}。${data.content}。白泽说：${data.baizeComment}`;
          const cleanText = readText.replace(/[*#`_~]/g, "");
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = "zh-CN";
          utterance.pitch = companion.age === "6-9" ? 1.5 : companion.age === "10-12" ? 1.3 : 1.0;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error(e);
        }

        addExp(data.pointsReward || 20);
        setCompanion((prev) => ({ ...prev, mood: "happy" }));
      }
    } catch (err) {
      console.error(err);
      setCompanion((prev) => ({ ...prev, mood: "sad" }));
    } finally {
      setIsScanning(false);
    }
  };

  const handleNextSimulatedApp = () => {
    setActiveAppIdx((prev) => (prev + 1) % SIMULATED_APPS.length);
    setActiveInsight(null);
  };

  const handlePrevSimulatedApp = () => {
    setActiveAppIdx((prev) => (prev - 1 + SIMULATED_APPS.length) % SIMULATED_APPS.length);
    setActiveInsight(null);
  };

  return (
    <div className="w-full max-w-sm mx-auto h-[740px] md:h-[780px] bg-[#0c1322] border-slate-800 rounded-[48px] border-[12px] shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative group">
      
      {/* Smartphone Notch Bar / Dynamic Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-full z-40 flex items-center justify-center border border-slate-800/40 shadow-sm">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <div className="w-1 h-1 bg-cyan-500 rounded-full" />
        </div>
        <div className="w-12 h-1 bg-slate-900 rounded mx-3" />
      </div>

      {/* Simulator top system Status bar */}
      <div className="h-9 bg-slate-950/80 px-7 flex items-center justify-between text-[10px] text-slate-300 font-medium tracking-tight z-30 select-none">
        <span className="font-mono">10:48 AM</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] bg-slate-800 text-cyan-400 px-1 rounded-sm border border-cyan-500/10 scale-90 font-mono">5G</span>
          <Wifi className="w-3 h-3 text-cyan-400" />
          <Battery className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[9px]">98%</span>
        </div>
      </div>

      {/* Primary Screens Router container */}
      <div className="flex-1 overflow-hidden relative bg-slate-950">
        
        {/* HOMESCREEN APP DRAWER & OVERLAY */}
        {activeScreen === "home" && (
          <div className="absolute inset-0 flex flex-col justify-between overflow-hidden">
            
            {/* Upper Stage: Active APP view on Home */}
            <div
              className={`flex-1 relative transition-all duration-300 flex flex-col justify-end p-4 text-white overflow-hidden ${
                currentApp.category === "idle" ? currentApp.mockScreenshotUrl : ""
              }`}
              style={{
                backgroundImage: currentApp.category !== "idle" ? currentApp.mockScreenshotUrl : "",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* App backdrop cover shield dimming details */}
              <div className="absolute inset-0 bg-slate-950/40 z-0" />

              {/* Simulated app details box top-left overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10 select-none">
                <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-705/30 text-left space-y-0.5 shadow-md">
                  <span className="text-[8px] bg-cyan-700/60 uppercase text-cyan-200 font-bold tracking-wider px-1 rounded-md">
                    模拟环境: {currentApp.appName}
                  </span>
                  <h4 className="text-[11px] font-bold text-slate-100 flex items-center gap-1">
                    <span>{currentApp.title}</span>
                  </h4>
                </div>

                {/* Simulated Parental notice block */}
                {parentConfig.announcementActive && (
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="max-w-[120px] bg-rose-950/80 backdrop-blur-sm border border-rose-800/40 px-2 py-1 rounded-lg text-[8px] text-rose-300 shadow-lg leading-snug flex flex-col gap-0.5"
                  >
                    <span className="font-bold flex items-center gap-0.5">🔔 家长叮嘱:</span>
                    <span className="truncate">{parentConfig.announcementText}</span>
                  </motion.div>
                )}
              </div>

              {/* Toggling bar for Simulated apps */}
              <div className="absolute bottom-16 left-0 right-0 flex items-center justify-between px-3 z-20 select-none">
                <button
                  onClick={handlePrevSimulatedApp}
                  className="w-7 h-7 rounded-full bg-slate-900/80 backdrop-blur border border-slate-750 flex items-center justify-center text-slate-300 hover:text-white"
                  title="上一个模拟场景"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <span className="text-[9px] font-medium text-slate-400 bg-slate-900/70 py-0.5 px-2 rounded-full border border-slate-800">
                    左右划选手机后台APP
                  </span>
                </div>

                <button
                  onClick={handleNextSimulatedApp}
                  className="w-7 h-7 rounded-full bg-slate-900/80 backdrop-blur border border-slate-750 flex items-center justify-center text-slate-300 hover:text-white"
                  title="下一个模拟场景"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Living reactive Baize floating element on top of mock app */}
              <div className="absolute bottom-28 left-12 right-12 flex flex-col items-center z-10">
                <div className="relative">
                  {/* Floating Speech bubble */}
                  <AnimatePresence>
                    {companion.mood !== "sleeping" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-950/90 text-slate-200 border border-slate-700 p-2.5 rounded-xl text-[9px] w-[180px] leading-relaxed text-center shadow-2xl backdrop-blur-md"
                      >
                        <span className="block font-bold mb-0.5 text-cyan-400">
                          {companion.petName} (Lv.{companion.level})
                        </span>
                        <span>
                          {companion.mood === "thinking"
                            ? "等一下，主人。我正在对全屏像素点进行中式电学法则辨析..."
                            : companion.mood === "happy"
                            ? "嗷呜~ 看到小主人这么认真探究，白泽的神格都精神抖擞啦！"
                            : currentApp.category === "idle"
                            ? "陪小主人静坐书桌，只要有探索宇宙之心，白泽永远在这里陪伴！"
                            : `我们在看'${currentApp.appName}'呢。点击【一键灵启感知】可以提取学霸硬核识见卡哦！`}
                        </span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-950" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active SVG Pet illustration widget */}
                  <BaizePet
                    mood={companion.mood}
                    level={companion.level}
                    onClick={() => {
                      // Trigger playful responses
                      const testMoods: any[] = ["happy", "surprised", "waving", "thinking"];
                      const newMood = testMoods[Math.floor(Math.random() * testMoods.length)];
                      setCompanion((prev) => ({ ...prev, mood: newMood }));
                      setTimeout(() => setCompanion((prev) => ({ ...prev, mood: "idle" })), 2000);
                      addExp(5);
                    }}
                  />
                </div>
              </div>

              {/* Active Radar Scanning Translucent Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-cyan-500/10 z-20 flex flex-col items-center justify-center pointer-events-none select-none">
                  {/* Scanner horizontal beam line animation */}
                  <motion.div
                    className="w-full h-1 bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,1)]"
                    animate={{ y: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                  />
                  <div className="absolute text-center bg-slate-950/90 p-2.5 border border-cyan-500/30 rounded-lg shadow-xl text-[9px] text-cyan-400 font-bold uppercase tracking-wider animate-pulse">
                    ⚡ 多模态屏幕感知：扫描并提取OCR数据中...
                  </div>
                </div>
              )}

              {/* Action: Trigger Perception Screen Sensing floating button */}
              {currentApp.category !== "idle" && (
                <div className="mb-2 w-full flex justify-center z-20">
                  <button
                    onClick={triggerScreenScan}
                    disabled={isScanning}
                    className="px-5 py-2 rounded-full bg-cyan-600 border border-cyan-400 text-white font-bold text-[11px] tracking-wide flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 transition-all active:scale-95 disabled:opacity-55"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>【一键灵启屏幕感知】</span>
                  </button>
                </div>
              )}
            </div>

            {/* Simulated Mobile Status Info Card */}
            <div className="h-20 bg-slate-900 border-t border-slate-800 p-2.5 flex flex-col justify-between z-10 select-none">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">白泽羁绊修真进度</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {companion.exp} / {companion.maxExp} EXP
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(companion.exp / companion.maxExp) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 font-medium">
                <span>阶位：{getFormNameByLevel(companion.level)}</span>
                <span>当前等级：Lv.{companion.level}</span>
              </div>
            </div>

            {/* Popup Insight Result modal card overlay */}
            <AnimatePresence>
              {activeInsight && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "100%" }}
                  className="absolute bottom-20 left-0 right-0 max-h-[300px] bg-slate-900/95 border-t border-cyan-500/30 rounded-t-3xl p-4 space-y-2.5 z-30 overflow-y-auto shadow-2xl backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-md">
                      #{activeInsight.subject} 开启
                    </span>
                    <button
                      onClick={() => setActiveInsight(null)}
                      className="text-slate-400 hover:text-white text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeInsight.title}</span>
                  </h4>
                  <p className="text-[10px] text-slate-300 leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-850">
                    {activeInsight.content}
                  </p>
                  <div className="p-2 bg-cyan-950/20 border border-cyan-900/35 rounded-lg flex gap-1.5 items-start">
                    <span className="text-xs">🐾</span>
                    <p className="text-[9px] text-cyan-400 italic font-medium leading-relaxed">
                      白泽说：“ {activeInsight.baizeComment} ”
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* COMPONANT VIEW: CHAT ROOM */}
        {activeScreen === "chat" && (
          <BaizeChat
            companion={companion}
            setCompanion={setCompanion}
            currentApp={currentApp.appName}
            addExp={addExp}
          />
        )}

        {/* COMPONANT VIEW: NOTEBOOK */}
        {activeScreen === "notebook" && (
          <StudyNotebook
            vocabulary={vocabulary}
            insights={insights}
            currentApp={currentApp.appName}
            addExp={addExp}
          />
        )}

        {/* COMPONANT VIEW: PARENT GUARDIAN */}
        {activeScreen === "parent" && <ParentConsole config={parentConfig} setConfig={setParentConfig} />}

        {/* COMPONANT VIEW: DEPLOYMENT HUB */}
        {activeScreen === "apk" && <ApkDeploymentHub />}

      </div>

      {/* FOOTER SYSTEM NAVIGATION CONTROL BUTTONS (Simulates physical Android tab navigation) */}
      <div className="h-16 bg-slate-950 border-t border-slate-900/80 px-4 flex items-center justify-around z-30 select-none">
        <button
          onClick={() => setActiveScreen("home")}
          className={`flex flex-col items-center gap-1 transition ${
            activeScreen === "home" ? "text-cyan-400 scale-105 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px]">瑞兽桌面</span>
        </button>

        <button
          onClick={() => setActiveScreen("chat")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeScreen === "chat" ? "text-cyan-400 scale-105 font-bold" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px]">白泽倾诉</span>
        </button>

        <button
          onClick={() => setActiveScreen("notebook")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeScreen === "notebook" ? "text-cyan-400 scale-105 font-bold" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          <BookMarked className="w-5 h-5" />
          <span className="text-[9px]">词卡本</span>
        </button>

        <button
          onClick={() => setActiveScreen("parent")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeScreen === "parent" ? "text-cyan-400 scale-105 font-bold" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[9px]">守护者</span>
        </button>

        <button
          onClick={() => setActiveScreen("apk")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeScreen === "apk" ? "text-cyan-400 scale-105 font-bold" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[9px]">安卓打包</span>
        </button>
      </div>

      {/* Android Virtual Gesture Pill bottom bar */}
      <div className="h-5 bg-slate-950 flex items-center justify-center pb-2 select-none z-30">
        <div className="w-32 h-1 bg-slate-800 rounded-full" />
      </div>

    </div>
  );
}
