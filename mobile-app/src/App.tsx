import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "motion/react";

type Mode = "wudao" | "jiangdao";
type Screen = "home" | "chat" | "notebook" | "guardian";
type Role = "user" | "baize";

interface ChatMessage {
  id: string;
  role: Role;
  text: string;
}

interface StudyCard {
  id: string;
  title: string;
  subject: string;
  content: string;
  pointsReward: number;
  createdAt: string;
  isMock?: boolean;
}

interface GuardianConfig {
  dailyLimit: number;
  quietMode: boolean;
  parentNote: string;
}

interface LearningScene {
  id: string;
  label: string;
  appName: string;
  subjectHint: string;
  description: string;
}

interface HealthState {
  hasGeminiKey: boolean;
  hasAiProvider?: boolean;
  model: string | null;
  mode: string;
  providers?: Array<{
    id: string;
    label: string;
    configured: boolean;
    model: string | null;
  }>;
}

const modeCopy: Record<Mode, { title: string; status: string; desc: string }> = {
  wudao: {
    title: "悟道",
    status: "截图与分析已关闭",
    desc: "安静陪伴，只保留待机、成长和轻提醒。",
  },
  jiangdao: {
    title: "讲道",
    status: "全部功能已开启",
    desc: "开启讲解、灵光感知、学习卡片和守护提醒。",
  },
};

const learningScenes: LearningScene[] = [
  {
    id: "minecraft",
    label: "Minecraft 红石机关",
    appName: "Minecraft",
    subjectHint: "物理",
    description: "画面里有红石火把、拉杆和自动门机关，孩子正在尝试让机关在相反信号下启动。",
  },
  {
    id: "moba-libai",
    label: "王者角色李白",
    appName: "王者荣耀",
    subjectHint: "历史",
    description: "画面中出现李白角色和诗句台词，适合引出唐代历史、安史之乱和永王案。",
  },
  {
    id: "plant-video",
    label: "植物科普视频",
    appName: "视频应用",
    subjectHint: "生物",
    description: "画面展示阳光照射植物叶片，适合讲解叶绿体、光合作用和能量转换。",
  },
  {
    id: "volcano",
    label: "火山爆发视频",
    appName: "视频应用",
    subjectHint: "化学",
    description: "画面展示火山喷发和烟雾，适合讲解二氧化硫、酸雨和酸碱中和。",
  },
];

const initialCards: StudyCard[] = [
  {
    id: "physics-redstone",
    title: "红石电路与非门",
    subject: "物理",
    content: "Minecraft 红石火把可以理解成 NOT Gate：输入有信号时输出关闭，输入关闭时输出亮起。",
    pointsReward: 15,
    createdAt: "初始卡片",
    isMock: true,
  },
  {
    id: "history-li-bai",
    title: "李白与永王案",
    subject: "历史",
    content: "游戏角色背后也能引出真实历史：安史之乱后的永王李璘事件影响了李白晚年命运。",
    pointsReward: 15,
    createdAt: "初始卡片",
    isMock: true,
  },
  {
    id: "biology-photosynthesis",
    title: "光合作用",
    subject: "生物",
    content: "草木场景可以连接叶绿体、光能转化和氧气释放，把画面变成生物学线索。",
    pointsReward: 15,
    createdAt: "初始卡片",
    isMock: true,
  },
];

const initialGuardian: GuardianConfig = {
  dailyLimit: 60,
  quietMode: false,
  parentNote: "学习 30 分钟后休息一下眼睛，白泽会温柔提醒。",
};

const initialMessages: ChatMessage[] = [
  {
    id: "hello",
    role: "baize",
    text: "我在这里。你可以问我学习问题，也可以让我把游戏、视频里的画面拆成知识卡片。",
  },
];

export default function App() {
  const [mode, setMode] = useState<Mode>("wudao");
  const [screen, setScreen] = useState<Screen>("home");
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(20);
  const [bubble, setBubble] = useState("点一点白泽，或者切到讲道模式试试灵光感知。");
  const [cards, setCards] = useState<StudyCard[]>(initialCards);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [guardian, setGuardian] = useState<GuardianConfig>(initialGuardian);
  const [isBusy, setIsBusy] = useState(false);
  const [sceneId, setSceneId] = useState(learningScenes[0].id);
  const [customScene, setCustomScene] = useState("");
  const [health, setHealth] = useState<HealthState>({ hasGeminiKey: false, model: null, mode: "checking" });

  useEffect(() => {
    const savedCards = window.localStorage.getItem("baize.studyCards");
    const savedGuardian = window.localStorage.getItem("baize.guardian");

    try {
      if (savedCards) setCards(JSON.parse(savedCards));
      if (savedGuardian) setGuardian(JSON.parse(savedGuardian));
    } catch {
      window.localStorage.removeItem("baize.studyCards");
      window.localStorage.removeItem("baize.guardian");
    }

    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ hasGeminiKey: false, model: null, mode: "offline" }));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("baize.studyCards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    window.localStorage.setItem("baize.guardian", JSON.stringify(guardian));
  }, [guardian]);

  const activeMode = modeCopy[mode];
  const currentScene = learningScenes.find((scene) => scene.id === sceneId) || learningScenes[0];
  const expPercent = useMemo(() => Math.min(exp, 100), [exp]);
  const aiReady = Boolean(health.hasAiProvider ?? health.hasGeminiKey);
  const aiStatusText = aiReady ? `AI 已连接：${health.model}` : "离线模式 · 本地智能演练";
  const aiStatusTone = aiReady ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-amber-300/25 bg-amber-300/10 text-amber-100";
  const offlineTip = aiReady
    ? "云端 AI 可用，白泽会优先使用真实模型。"
    : "暂时没有可用 API，白泽会用内置知识与本地卡片继续陪伴。";

  const addExp = (amount: number) => {
    setExp((current) => {
      const next = current + amount;
      if (next >= 100) {
        setLevel((oldLevel) => Math.min(oldLevel + 1, 99));
        return next - 100;
      }
      return next;
    });
  };

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setBubble(modeCopy[nextMode].desc);
  };

  const interactWithBaize = () => {
    addExp(3);
    setBubble(
      mode === "wudao"
        ? "悟道模式下，我会安静陪着你，不主动读取或分析屏幕。"
        : `讲道模式已开启。当前观察场景是：${currentScene.label}。`
    );
  };

  const perceiveScreen = async () => {
    if (mode === "wudao") {
      setBubble("现在是悟道模式，截图和分析入口已关闭。切到讲道后我再帮你看画面。");
      return;
    }

    const context = {
      appName: currentScene.appName,
      subjectHint: currentScene.subjectHint,
      description: customScene.trim() || currentScene.description,
    };

    setIsBusy(true);
    try {
      const res = await fetch("/api/baize/perceive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      const data = await res.json();
      const newCard: StudyCard = {
        id: `${Date.now()}`,
        title: data.title,
        subject: data.subject,
        content: data.content,
        pointsReward: data.pointsReward || 15,
        createdAt: new Date().toLocaleString(),
        isMock: data.isMock,
      };

      setCards((current) => [newCard, ...current]);
      addExp(newCard.pointsReward);
      setBubble(`${data.isMock ? "本地" : "AI"}已生成学习卡片：${newCard.title}`);
      setScreen("notebook");
    } catch {
      setBubble("灵光感知暂时失败了，但本地原型还在正常运行。");
    } finally {
      setIsBusy(false);
    }
  };

  const sendChat = async (event: FormEvent) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || isBusy) return;

    const userMessage: ChatMessage = { id: `${Date.now()}-user`, role: "user", text };
    setMessages((current) => [...current, userMessage]);
    setChatInput("");
    setIsBusy(true);

    try {
      const res = await fetch("/api/baize/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode }),
      });
      const data = await res.json();
      const reply: ChatMessage = {
        id: `${Date.now()}-baize`,
        role: "baize",
        text: data.text || "我听见了。这个问题我们可以慢慢拆。",
      };
      setMessages((current) => [...current, reply]);
      setBubble(data.isMock ? "白泽已用本地回复回答。" : "白泽已用 AI 回复回答。");
      addExp(8);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "baize",
          text: "本地服务暂时没有回应。你仍然可以继续浏览学习卡片。",
        },
      ]);
    } finally {
      setIsBusy(false);
    }
  };

  const resetNotebook = () => {
    setCards(initialCards);
    setBubble("学习卡片已经恢复为初始示例。");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(250,204,21,0.12),transparent_26%),linear-gradient(135deg,#07111f_0%,#030712_70%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-center lg:justify-center">
        <section className="space-y-5 lg:w-[420px]">
          <div className="rounded-[32px] border border-cyan-300/15 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.35em] text-cyan-300">PROJECT BAIZE</p>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black ${aiStatusTone}`}>
                {aiReady ? "CLOUD" : "LOCAL"}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight">白泽 AI 桌面宠物</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              手机端 MVP 已经具备陪伴、模式切换、灵光感知、学习卡片和守护设置。即使没有 API，也会保持完整的离线体验。
            </p>
            <div className={`mt-4 rounded-2xl border px-3 py-3 text-xs font-bold ${aiStatusTone}`}>
              <p>{aiStatusText}</p>
              <p className="mt-1 font-medium opacity-80">{offlineTip}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="等级" value={`Lv.${level}`} />
              <MiniStat label="卡片" value={`${cards.length}`} />
              <MiniStat label="模式" value={activeMode.title} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(["wudao", "jiangdao"] as Mode[]).map((item) => (
              <button
                key={item}
                onClick={() => changeMode(item)}
                className={`rounded-2xl border p-4 text-left transition ${
                  mode === item
                    ? "border-cyan-300 bg-cyan-400/15 shadow-lg shadow-cyan-950"
                    : "border-slate-700 bg-slate-900/70 hover:border-slate-500"
                }`}
              >
                <span className="text-lg font-black">{modeCopy[item].title}</span>
                <span className="mt-2 block text-xs leading-5 text-slate-300">{modeCopy[item].status}</span>
                <span className="mt-3 block rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                  {modeCopy[item].desc}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-[28px] border border-slate-800 bg-slate-950/75 p-5 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-cyan-200">画面场景</h2>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-slate-400">
                {mode === "jiangdao" ? "可感知" : "已静默"}
              </span>
            </div>
            <label className="mt-3 block text-xs text-slate-400">
              当前模拟画面
              <select
                value={sceneId}
                onChange={(event) => setSceneId(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300"
              >
                {learningScenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs text-slate-400">
              自定义画面描述
              <textarea
                value={customScene}
                onChange={(event) => setCustomScene(event.target.value)}
                placeholder="可选：写下当前手机画面，例如一道数学题、游戏场景或视频内容。"
                className="mt-2 h-20 w-full rounded-2xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-cyan-300"
              />
            </label>
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-400">
              离线模式会根据场景关键词生成卡片；接入 API 后，同一入口会自动升级为真实分析。
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[390px]">
          <div className="overflow-hidden rounded-[42px] border-[10px] border-slate-900 bg-slate-950 shadow-2xl shadow-black">
            <div className="flex h-8 items-center justify-between bg-slate-950 px-6 text-[10px] text-slate-400">
              <span>10:48</span>
              <span>{aiReady ? "AI" : "LOCAL"} · 98%</span>
            </div>

            <div className="relative min-h-[720px] overflow-hidden bg-[radial-gradient(circle_at_top,#19516f_0%,#07111f_42%,#030712_100%)]">
              <div className="absolute -left-16 top-16 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="absolute -right-20 bottom-36 h-44 w-44 rounded-full bg-amber-200/10 blur-3xl" />
              <StatusCard
                activeMode={activeMode}
                aiReady={aiReady}
                aiStatusText={aiStatusText}
                cards={cards.length}
                expPercent={expPercent}
                level={level}
              />

              <motion.div
                className="absolute left-5 right-5 top-36 z-10 rounded-3xl border border-cyan-300/20 bg-slate-950/70 p-4 text-center text-sm leading-6 text-slate-100 shadow-xl backdrop-blur"
                key={bubble}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {bubble}
              </motion.div>

              <motion.button
                onClick={interactWithBaize}
                className="absolute left-1/2 top-[252px] z-10 w-[300px] -translate-x-1/2 focus:outline-none"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                aria-label="点击白泽"
              >
                <img
                  src="/assets/baize.png"
                  alt="双山羊角白泽桌面宠物"
                  className="w-full drop-shadow-[0_24px_45px_rgba(0,0,0,0.55)]"
                  draggable={false}
                />
              </motion.button>

              <div className="absolute bottom-24 left-4 right-4 z-20 grid grid-cols-2 gap-2">
                <button
                  onClick={perceiveScreen}
                  disabled={isBusy}
                  className={`rounded-2xl px-4 py-3 text-sm font-black shadow-lg active:scale-95 disabled:opacity-60 ${
                    mode === "jiangdao"
                      ? "bg-cyan-400 text-slate-950 shadow-cyan-950"
                      : "border border-white/10 bg-white/10 text-slate-300"
                  }`}
                >
                  {isBusy ? "感知中" : mode === "jiangdao" ? "灵光感知" : "悟道静默"}
                </button>
                <button
                  onClick={() => setScreen("chat")}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white active:scale-95 hover:bg-white/15"
                >
                  问白泽
                </button>
              </div>

              {screen !== "home" && (
                <div className="absolute inset-x-4 bottom-24 z-30 max-h-[390px] overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/60 backdrop-blur">
                  {screen === "chat" && (
                    <Panel title="问白泽" subtitle={aiReady ? "云端优先回答，失败自动本地兜底" : "当前为离线演练回答"}>
                      <div className="space-y-2">
                        {messages.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-2xl p-3 text-xs leading-5 ${
                              item.role === "baize" ? "bg-slate-900 text-slate-200" : "bg-cyan-500 text-slate-950"
                            }`}
                          >
                            {item.text}
                          </div>
                        ))}
                      </div>
                      <form onSubmit={sendChat} className="mt-3 flex gap-2">
                        <input
                          value={chatInput}
                          onChange={(event) => setChatInput(event.target.value)}
                          placeholder="问一个学习问题"
                          className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-cyan-300"
                        />
                        <button className="rounded-2xl bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950">
                          发送
                        </button>
                      </form>
                    </Panel>
                  )}

                  {screen === "notebook" && (
                    <Panel
                      title="学习卡片"
                      subtitle="把游戏、视频和日常画面沉淀成知识"
                      action={
                        <button onClick={resetNotebook} className="text-xs font-bold text-slate-400 hover:text-cyan-200">
                          重置
                        </button>
                      }
                    >
                      <div className="space-y-2">
                        {cards.map((card) => (
                          <div key={card.id} className="rounded-2xl bg-slate-900 p-3">
                            <p className="text-xs font-bold text-cyan-300">
                              {card.subject} · {card.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-300">{card.content}</p>
                            <p className="mt-2 text-[10px] text-slate-500">
                              +{card.pointsReward} EXP · {card.createdAt} · {card.isMock ? "本地" : "AI"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  )}

                  {screen === "guardian" && (
                    <Panel title="守护设置" subtitle="离线保存在本机，不上传隐私数据">
                      <div className="space-y-3 text-xs text-slate-300">
                        <label className="block">
                          <span className="mb-1 block text-slate-400">每日使用上限：{guardian.dailyLimit} 分钟</span>
                          <input
                            type="range"
                            min="20"
                            max="120"
                            step="10"
                            value={guardian.dailyLimit}
                            onChange={(event) =>
                              setGuardian((current) => ({ ...current, dailyLimit: Number(event.target.value) }))
                            }
                            className="w-full"
                          />
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={guardian.quietMode}
                            onChange={(event) =>
                              setGuardian((current) => ({ ...current, quietMode: event.target.checked }))
                            }
                          />
                          安静提醒，不弹出强提示
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-slate-400">家长提醒语</span>
                          <textarea
                            value={guardian.parentNote}
                            onChange={(event) =>
                              setGuardian((current) => ({ ...current, parentNote: event.target.value }))
                            }
                            className="h-20 w-full rounded-2xl border border-slate-700 bg-slate-900 p-3 outline-none focus:border-cyan-300"
                          />
                        </label>
                      </div>
                    </Panel>
                  )}
                </div>
              )}

              <BottomNav screen={screen} setScreen={setScreen} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusCard({
  activeMode,
  aiReady,
  aiStatusText,
  cards,
  expPercent,
  level,
}: {
  activeMode: { title: string; status: string };
  aiReady: boolean;
  aiStatusText: string;
  cards: number;
  expPercent: number;
  level: number;
}) {
  return (
    <div className="absolute inset-x-5 top-5 z-10 rounded-[28px] border border-white/10 bg-slate-950/60 p-4 shadow-xl shadow-black/30 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-cyan-300">当前模式：{activeMode.title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">{activeMode.status}</p>
          <p className={aiReady ? "mt-1 text-[10px] text-emerald-200" : "mt-1 text-[10px] text-amber-200"}>
            {aiStatusText}
          </p>
        </div>
        <span className="rounded-full bg-cyan-300/15 px-3 py-1 text-[11px] font-bold text-cyan-200">Lv.{level}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${expPercent}%` }} />
      </div>
      <p className="mt-2 text-[10px] text-slate-400">已保存 {cards} 张学习卡片</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2">
      <p className="text-[10px] font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-100">{value}</p>
    </div>
  );
}

function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) {
  const items: Array<[Screen, string]> = [
    ["home", "桌面"],
    ["chat", "对话"],
    ["notebook", "笔记"],
    ["guardian", "守护"],
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-slate-950/95 px-4 py-3">
      <div className="grid grid-cols-4 gap-2 text-[11px]">
        {items.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setScreen(key)}
            className={`rounded-xl py-2 font-bold transition ${
              screen === key ? "bg-cyan-300 text-slate-950" : "bg-slate-900 text-slate-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-cyan-200">{title}</h2>
          {subtitle && <p className="mt-1 text-[10px] font-medium text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-3 text-sm leading-6 text-slate-300">{children}</div>
    </div>
  );
}
