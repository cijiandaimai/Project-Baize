import React, { useState, useEffect } from "react";
import { BookOpen, LineChart as ChartIcon, Trophy, Check, ArrowRight, Play, Award, Volume2, Sparkles } from "lucide-react";
import { type VocabularyItem, type ScreenInsight, type QuizQuestion } from "../types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "motion/react";

interface StudyNotebookProps {
  vocabulary: VocabularyItem[];
  insights: ScreenInsight[];
  currentApp: string;
  addExp: (amount: number) => void;
}

export default function StudyNotebook({ vocabulary, insights, currentApp, addExp }: StudyNotebookProps) {
  const [activeTab, setActiveTab] = useState<"words" | "insights" | "trials" | "stats">("words");
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizStatus, setQuizStatus] = useState<"idle" | "correct" | "wrong" | "fetching">("idle");
  const [quizFeedback, setQuizFeedback] = useState("");

  const mockStatsData = [
    { name: "周一", words: 4, insights: 3, studyMins: 12 },
    { name: "周二", words: 8, insights: 5, studyMins: 20 },
    { name: "周三", words: 5, insights: 4, studyMins: 15 },
    { name: "周四", words: 12, insights: 7, studyMins: 28 },
    { name: "周五", words: 9, insights: 5, studyMins: 22 },
    { name: "周六", words: 15, insights: 10, studyMins: 35 },
    { name: "周日", words: vocabulary.length, insights: insights.length, studyMins: 45 },
  ];

  // Fetch a quiz based on current environment
  const fetchNewQuiz = async () => {
    setQuizStatus("fetching");
    setSelectedAns(null);
    try {
      const res = await fetch("/api/baize/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: { appName: currentApp, category: "game" },
          age: "10-12",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuiz(data);
        setQuizStatus("idle");
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setQuiz({
        id: "fb_opt",
        question: "在白泽大千世界法则中，‘Photosynthesis’即光合作用，这主要是地球哪类生命体吸收二氧化碳并释放出氧气的过程？",
        options: ["古菌与黏菌类", "藻类与绿色植物", "哺乳门动物"],
        correctAnswerIndex: 1,
        explanation: "光合作用是绿色植物以及蓝藻等通过阳光、叶绿素合成碳水化合物并释放氧气的奇妙过程。这也是最初始的元素生化规律哦！",
        subject: "生物",
        expReward: 30,
      });
      setQuizStatus("idle");
    }
  };

  useEffect(() => {
    if (activeTab === "trials" && !quiz) {
      fetchNewQuiz();
    }
  }, [activeTab]);

  const handleSpeech = (word: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
    }
  };

  const checkAnswer = (index: number) => {
    if (!quiz || quizStatus !== "idle") return;
    setSelectedAns(index);
    if (index === quiz.correctAnswerIndex) {
      setQuizStatus("correct");
      addExp(quiz.expReward);
      setQuizFeedback(`⭐⭐ 正确！恭喜获得 +${quiz.expReward} EXP 主神兽经验增益！`);
    } else {
      setQuizStatus("wrong");
      setQuizFeedback("哎呀，答错啦，不过没关系。读一读下面的真理解析，一定能掌握这条法则！");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Sub menu tabs */}
      <div className="flex bg-slate-800 border-b border-slate-700/60 p-1">
        <button
          onClick={() => setActiveTab("words")}
          className={`flex-1 flex flex-col items-center py-2 text-[10px] sm:text-xs rounded font-medium transition-all ${
            activeTab === "words" ? "bg-slate-700 text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>单词本 ({vocabulary.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex-1 flex flex-col items-center py-2 text-[10px] sm:text-xs rounded font-medium transition-all ${
            activeTab === "insights" ? "bg-slate-700 text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Trophy className="w-4 h-4 mb-0.5" />
          <span>大千识见 ({insights.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("trials")}
          className={`flex-1 flex flex-col items-center py-2 text-[10px] sm:text-xs rounded font-medium transition-all ${
            activeTab === "trials" ? "bg-slate-700 text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Award className="w-4 h-4 mb-0.5" />
          <span>山海试炼</span>
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 flex flex-col items-center py-2 text-[10px] sm:text-xs rounded font-medium transition-all ${
            activeTab === "stats" ? "bg-slate-700 text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ChartIcon className="w-4 h-4 mb-0.5" />
          <span>成长报告</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pwa-safebottom bg-slate-900 scrollbar-thin scrollbar-thumb-slate-800">
        <AnimatePresence mode="wait">
          {activeTab === "words" && (
            <motion.div
              key="words_tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">自动同步的场景拼写本词库</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  由游戏内提取
                </span>
              </div>

              {vocabulary.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <BookOpen className="w-8 h-8 mx-auto stroke-[1.5] mb-2" />
                  <p className="text-xs">目前暂无收录的单词。</p>
                  <p className="text-[10px] mt-1 text-slate-600">在游戏/视频场景中，点击【深度感知】即可提取！</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {vocabulary.map((v) => (
                    <div
                      key={v.id}
                      className="bg-slate-800/90 border border-slate-700/60 p-3 rounded-xl flex items-start justify-between shadow-sm hover:border-slate-600 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono tracking-wide text-cyan-300">{v.word}</span>
                          <span className="text-[10px] text-slate-400 font-mono">[{v.phonetic}]</span>
                          <button
                            onClick={() => handleSpeech(v.word)}
                            className="p-1 rounded-sm bg-slate-705 text-cyan-400 hover:text-cyan-300 hover:bg-slate-700 transition"
                            title="点读发音"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-200">{v.translation}</p>
                        <p className="text-[10px] text-slate-400 italic">“ {v.example} ”</p>
                        <p className="text-[10px] text-slate-400">{v.exampleTranslation}</p>
                        <div className="flex items-center gap-1.5 pt-1.5 mt-1 border-t border-slate-700/50">
                          <span className="text-[9px] bg-cyan-950/80 text-cyan-400 px-1.5 py-0.5 rounded-md font-medium">
                            场景: {v.sourceGame}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="insights_tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">已解锁的神兽大千识见卡</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  白泽所识天下事
                </span>
              </div>

              {insights.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Trophy className="w-8 h-8 mx-auto stroke-[1.5] mb-2" />
                  <p className="text-xs">暂时没开启任何识见卡。</p>
                  <p className="text-[10px] mt-1 text-slate-600">在玩《王者李白》或《红石门》时灵启感知解锁！</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.map((card) => (
                    <div
                      key={card.id}
                      className="bg-slate-800/90 border border-slate-700/60 p-3.5 rounded-xl space-y-2.5 relative overflow-hidden group hover:border-cyan-500/50 transition-all shadow-md"
                    >
                      {/* Subject tag top right */}
                      <span className="absolute top-3 right-3 text-[9px] font-semibold bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded">
                        #{card.subject}
                      </span>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 pr-14">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <span>{card.title}</span>
                        </h4>
                        <span className="text-[9px] text-slate-500 block">{card.timestamp}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed bg-slate-900/65 p-2 rounded-lg">
                        {card.content}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-700/50">
                        <span>经验反哺: <strong className="text-cyan-400 font-mono">+{card.pointsReward}</strong> EXP</span>
                        <span>⭐ 神兽识记</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "trials" && (
            <motion.div
              key="trials_tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">山海白泽试炼 (法则考验)</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  答对积累神力
                </span>
              </div>

              {quizStatus === "fetching" ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                  <div className="relative w-8 h-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-500" />
                  <p className="text-xs">白泽正在虚空中编织试炼法则...</p>
                </div>
              ) : quiz ? (
                <div className="bg-slate-800/90 border border-slate-700/60 p-4 rounded-xl space-y-4 shadow-md">
                  <div className="flex items-center justify-between text-[9px] border-b border-slate-700/60 pb-2">
                    <span className="bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      试炼学科: {quiz.subject}
                    </span>
                    <span className="text-slate-400">奖励 +{quiz.expReward} EXP</span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed">
                    {quiz.question}
                  </p>

                  <div className="space-y-2">
                    {quiz.options.map((opt, idx) => {
                      const isSelected = selectedAns === idx;
                      const isCorrect = idx === quiz.correctAnswerIndex;
                      
                      let btnStyle = "bg-slate-900 hover:bg-slate-700/55 border-slate-700 text-slate-300";
                      
                      if (selectedAns !== null) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-400";
                        } else if (isSelected) {
                          btnStyle = "bg-red-950/40 border-red-500 text-red-400";
                        } else {
                          btnStyle = "opacity-44 bg-slate-900 border-slate-800 text-slate-500";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={selectedAns !== null}
                          onClick={() => checkAnswer(idx)}
                          className={`w-full p-3 text-xs text-left rounded-lg border font-medium flex items-center justify-between transition-all ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {selectedAns !== null && isCorrect && <Check className="w-4 h-4 text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback explanation */}
                  {selectedAns !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-2"
                    >
                      <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>白泽真理解读</span>
                      </h4>
                      <p className="text-[11px] leading-relaxed text-slate-300">{quiz.explanation}</p>
                      <p className="text-[10px] italic text-slate-400 font-medium">{quizFeedback}</p>
                    </motion.div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={fetchNewQuiz}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <span>下一题试炼</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats_tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">灵理宿命·神兽成长数据</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  本周知识吸收量
                </span>
              </div>

              {/* Stats overview boxes */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/60 text-center space-y-0.5">
                  <span className="text-[9px] text-slate-400 block font-medium">累计收录词汇</span>
                  <strong className="text-lg font-bold font-mono text-cyan-400">{vocabulary.length}</strong>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/60 text-center space-y-0.5">
                  <span className="text-[9px] text-slate-400 block font-medium">触发智能识见</span>
                  <strong className="text-lg font-bold font-mono text-cyan-400">{insights.length}</strong>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/60 text-center space-y-0.5">
                  <span className="text-[9px] text-slate-400 block font-medium">修真总时长</span>
                  <strong className="text-lg font-bold font-mono text-cyan-400">177 <span className="text-[9px] text-slate-400">分</span></strong>
                </div>
              </div>

              {/* Chart container */}
              <div className="bg-slate-800 border border-slate-700/60 p-3.5 rounded-xl space-y-3 shadow-md">
                <span className="text-[10px] font-semibold text-slate-400">识见量与收词量增长趋势 (周)</span>
                <div className="w-full h-42">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockStatsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "9px" }} />
                      <YAxis stroke="#64748b" style={{ fontSize: "9px" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", fontSize: "10px" }}
                        labelStyle={{ fontWeight: "bold", color: "#10b981" }}
                      />
                      <Line type="monotone" dataKey="words" stroke="#06b6d4" strokeWidth={2.5} name="识字量" />
                      <Line type="monotone" dataKey="insights" stroke="#f43f5e" strokeWidth={2.5} name="识见点" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[9px] text-slate-400 text-center flex justify-center items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> 场景词汇量</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> 瑞兽识见点</span>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/50 p-3.5 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200">瑞兽神魂修复进度（当前26%）</h4>
                  <p className="text-[10px] text-slate-400">在游玩其它安卓游戏及应用时自动提取知识，点亮星图！</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
