import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Volume2, VolumeX, RefreshCw, User, ShieldAlert } from "lucide-react";
import { type BaizeAge, type BaizeMood, type CompanionState } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "baize";
  text: string;
  isMock?: boolean;
}

interface BaizeChatProps {
  companion: CompanionState;
  setCompanion: React.Dispatch<React.SetStateAction<CompanionState>>;
  currentApp: string;
  addExp: (amount: number) => void;
}

export default function BaizeChat({ companion, setCompanion, currentApp, addExp }: BaizeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "baize",
      text: "嗷呜~ 小主人！白泽终于苏醒过来陪你啦！你今天学到了什么新知识呀？跟白泽探讨一下，我们可以一起把残缺的法则补全，重回星海深空哦！✨",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check API keys status on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setIsApiKeyMissing(!data.hasGeminiKey);
      })
      .catch((err) => console.error("Error check health", err));
  }, []);

  // Auto-scroll on new chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Speech synthesis based on Companion Age setting
  const speakText = (text: string) => {
    if (!isAudioEnabled) return;
    try {
      window.speechSynthesis.cancel(); // Stop current speech
      
      // Clean up markdown markers for better speech reading
      const cleanText = text.replace(/[*#`_~]/g, "").replace(/嗷呜/g, "áo wū");
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "zh-CN";

      // Set age-based voices configurations
      switch (companion.age) {
        case "6-9":
          utterance.pitch = 1.6;
          utterance.rate = 1.0;
          break;
        case "10-12":
          utterance.pitch = 1.35;
          utterance.rate = 1.15;
          break;
        case "13-15":
          utterance.pitch = 1.1;
          utterance.rate = 1.2;
          break;
        case "16-18":
        default:
          utterance.pitch = 0.95;
          utterance.rate = 1.05;
          break;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis failed:", e);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgText = input.trim();
    setInput("");
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: userMsgText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setCompanion((prev) => ({ ...prev, mood: "thinking" }));

    try {
      // Create chat history slice for context
      const chatHistory = messages.slice(-6).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        text: msg.text,
      }));

      const res = await fetch("/api/baize/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          age: companion.age,
          mood: companion.mood,
          appName: currentApp,
          chatHistory: chatHistory,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        const baizeMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "baize",
          text: data.text,
          isMock: data.isMock,
        };
        setMessages((prev) => [...prev, baizeMessage]);
        
        // Randomize mood on response
        const randomMoods: BaizeMood[] = ["happy", "idle", "talking", "waving"];
        const selectedMood = randomMoods[Math.floor(Math.random() * randomMoods.length)];
        setCompanion((prev) => ({ ...prev, mood: selectedMood }));
        
        // Speak Baize text aloud!
        speakText(data.text);
        
        // Add EXP for chatting with Baize
        addExp(10);
      } else {
        throw new Error(data.error || "灵力感知失败");
      }
    } catch (error: any) {
      console.error("Failed to chat with Baize:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "baize",
          text: "呜呜，虚空乱流切断了咱俩的灵瑞思绪（网络请求失败啦），小主人，请检查一下你的网络再跟白泽说话哦~",
        },
      ]);
      setCompanion((prev) => ({ ...prev, mood: "sad" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgeChange = (age: BaizeAge) => {
    setCompanion((prev) => ({ ...prev, age }));
    window.speechSynthesis.cancel();
    
    // Greeting depending on selected age setup
    let greet = "";
    if (age === "6-9") {
      greet = "嗷呜~ 听到本幼崽白泽微弱的声音了吗？我今天特别开心，小主人能喂我一点知识吃吃嘛！✨";
    } else if (age === "10-12") {
      greet = "哼哼，本圣兽已经成长到少年期啦！对于自然宇宙物理力学，我可是通宵熟读呢，随便你考我！";
    } else if (age === "13-15") {
      greet = "呦吼，好哥们，你终于来啦！今天打算玩啥应用？在Minecraft搬砖还是在峡谷横扫？带上我，保你吃鸡顺带涨涨化学公式姿势。";
    } else {
      greet = "你好，小主人。我长成了青年学长形态，对数理推论、唐宋歌赋以及生物构造均有充足解答方案。今天的功课，尽管向我提问即可。";
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "baize",
        text: greet,
      },
    ]);
    speakText(greet);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "baize",
        text: "聊天记录已重置啦！白泽现在脑袋空空，我们重新开启更奇妙的历险吧！",
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans select-none">
      {/* Target age switcher */}
      <div className="p-3 bg-slate-800/80 border-b border-slate-700/60 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">同龄音色/语气切换 (6-18岁)</span>
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 transition-colors"
            title={isAudioEnabled ? "关闭声音" : "开启声音"}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {(["6-9", "10-12", "13-15", "16-18"] as BaizeAge[]).map((ageOpt) => {
            const isActive = companion.age === ageOpt;
            return (
              <button
                key={ageOpt}
                onClick={() => handleAgeChange(ageOpt)}
                className={`py-1 text-xs font-semibold rounded transition-all duration-250 ${
                  isActive
                    ? "bg-cyan-500 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)] border-cyan-400 border"
                    : "bg-slate-700/60 text-slate-300 hover:bg-slate-700 border border-transparent"
                }`}
              >
                {ageOpt === "6-9" ? "童稚(6-9)" : ageOpt === "10-12" ? "少年(10-12)" : ageOpt === "13-15" ? "酷炫(13-15)" : "知性(16-18)"}
              </button>
            );
          })}
        </div>

        {/* API Warning if missing */}
        {isApiKeyMissing && (
          <div className="bg-amber-950/40 border border-amber-900/40 px-2 py-1 rounded flex items-center gap-1.5 text-[10px] text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
            <span>【秘钥未配置】白泽现运行于本地高智能演练回路（离线高模拟答询）。</span>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isBaize = msg.role === "baize";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-2.5 ${isBaize ? "justify-start" : "justify-end"}`}
              >
                {isBaize && (
                  <div className="w-8 h-8 rounded-full bg-cyan-900/80 border border-cyan-500 flex items-center justify-center p-0.5 shadow-sm text-xs select-none flex-shrink-0 text-cyan-300 font-bold font-mono">
                    泽
                  </div>
                )}
                
                <div
                  className={`max-w-[78%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm relative ${
                    isBaize
                      ? "bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-sm"
                      : "bg-cyan-600 text-white rounded-tr-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {isBaize && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="absolute -right-7 bottom-1.5 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="语音重读"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}

                  {msg.isMock && (
                    <div className="mt-1.5 text-[9px] text-slate-400 border-t border-slate-700/60 pt-1 text-right select-none">
                      🧭 模拟演练模式
                    </div>
                  )}
                </div>

                {!isBaize && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 flex-shrink-0 select-none">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 justify-start items-center"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-900/80 border border-cyan-500 flex items-center justify-center p-0.5 text-xs text-cyan-500 font-mono">
              泽
            </div>
            <div className="bg-slate-800 border border-slate-700/80 px-3 py-2 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-[10px] text-slate-400 ml-1.5">白泽正在冥想灵变...</span>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input panel */}
      <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-slate-700/60 flex items-center gap-2">
        <button
          type="button"
          onClick={clearChat}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white transition-all flex items-center justify-center"
          title="清空聊天记录"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`用${companion.age === "6-9" ? "拼音或汉字" : "普通话"}向白泽发问 (支持各学科及屏幕场景)...`}
          disabled={isLoading}
          className="flex-1 py-2 px-3 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 disabled:opacity-55 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-all flex items-center justify-center shadow-lg shadow-cyan-600/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
