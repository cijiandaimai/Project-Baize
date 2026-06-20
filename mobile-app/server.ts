import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const appUrl = process.env.APP_URL || "http://localhost:3000";

app.use(express.json({ limit: "2mb" }));

interface ScreenContext {
  appName?: string;
  description?: string;
  subjectHint?: string;
}

interface InsightCard {
  title: string;
  subject: string;
  content: string;
  pointsReward: number;
  baizeComment: string;
}

let aiClient: GoogleGenAI | null = null;

type ProviderId = "groq" | "gemini" | "nvidia" | "github" | "openrouter";

interface ChatResult {
  text: string;
  provider: string;
  model: string;
}

interface OpenAICompatibleProvider {
  id: Exclude<ProviderId, "gemini">;
  label: string;
  apiKey?: string;
  model: string;
  endpoint: string;
  headers?: Record<string, string>;
}

function hasRealSecret(value?: string) {
  const secret = value?.trim();
  return Boolean(secret && !secret.startsWith("MY_") && !secret.startsWith("YOUR_") && secret !== "填这里");
}

function hasGeminiKey() {
  return hasRealSecret(process.env.GEMINI_API_KEY);
}

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function getOpenAIProviders(): OpenAICompatibleProvider[] {
  return [
    {
      id: "groq",
      label: "Groq",
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
    },
    {
      id: "nvidia",
      label: "NVIDIA NIM",
      apiKey: process.env.NVIDIA_API_KEY,
      model: process.env.NVIDIA_MODEL || "nvidia/llama-3.1-nemotron-nano-8b-v1",
      endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    },
    {
      id: "github",
      label: "GitHub Models",
      apiKey: process.env.GITHUB_MODELS_API_KEY || process.env.GITHUB_TOKEN,
      model: process.env.GITHUB_MODELS_MODEL || "openai/gpt-4.1-mini",
      endpoint: "https://models.github.ai/inference/chat/completions",
    },
    {
      id: "openrouter",
      label: "OpenRouter",
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-r1-0528:free",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        "HTTP-Referer": appUrl,
        "X-Title": "Baize AI Desktop Pet",
      },
    },
  ];
}

function getProviderOrder(): ProviderId[] {
  const configured = (process.env.AI_PROVIDER_ORDER || "groq,gemini,nvidia,github,openrouter")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean) as ProviderId[];
  const allowed: ProviderId[] = ["groq", "gemini", "nvidia", "github", "openrouter"];
  return configured.filter((provider) => allowed.includes(provider));
}

function getProviderStatus() {
  const openAIProviders = getOpenAIProviders();
  return getProviderOrder().map((id) => {
    if (id === "gemini") {
      return {
        id,
        label: "Gemini",
        configured: hasGeminiKey(),
        model: geminiModel,
      };
    }

    const provider = openAIProviders.find((item) => item.id === id);
    return {
      id,
      label: provider?.label || id,
      configured: hasRealSecret(provider?.apiKey),
      model: provider?.model || null,
    };
  });
}

async function callOpenAICompatible(
  provider: OpenAICompatibleProvider,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
): Promise<ChatResult> {
  if (!hasRealSecret(provider.apiKey)) {
    throw new Error(`${provider.label} API key is not configured`);
  }

  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
      ...(provider.headers || {}),
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: 0.7,
      max_tokens: 220,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${provider.label} failed: ${response.status} ${errorText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error(`${provider.label} returned an empty response`);
  }

  return {
    text,
    provider: provider.label,
    model: provider.model,
  };
}

async function callGeminiChat(message: string, mode: string): Promise<ChatResult> {
  if (!hasGeminiKey()) {
    throw new Error("Gemini API key is not configured");
  }

  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `用户说：${message}`,
    config: {
      systemInstruction:
        "你叫白泽，是双山羊角、白色、温柔但有一点骄傲的 AI 学习桌宠。请用中文回答。回答要适合中小学生，简洁、有启发，不要超过 120 字。当前模式：" +
        mode,
    },
  });

  return {
    text: response.text || offlineChatReply(message, mode),
    provider: "Gemini",
    model: geminiModel,
  };
}

async function generateChatReply(message: string, mode: string): Promise<ChatResult> {
  const systemPrompt =
    "你叫白泽，是双山羊角、白色、温柔但有一点骄傲的 AI 学习桌宠。请用中文回答，适合中小学生，简洁、有启发，不要超过 120 字。当前模式：" +
    mode;
  const openAIProviders = getOpenAIProviders();
  const errors: string[] = [];

  for (const providerId of getProviderOrder()) {
    try {
      if (providerId === "gemini") {
        return await callGeminiChat(message, mode);
      }

      const provider = openAIProviders.find((item) => item.id === providerId);
      if (!provider) {
        continue;
      }
      return await callOpenAICompatible(provider, [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ]);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(errors.join(" | ") || "No AI provider is configured");
}

const fallbackCards: InsightCard[] = [
  {
    title: "红石电路与非门",
    subject: "物理",
    content: "红石火把像一个 NOT Gate：输入有电时输出熄灭，输入无电时输出亮起。游戏里的机关，其实藏着数字电路的基本逻辑。",
    pointsReward: 18,
    baizeComment: "你已经摸到电子世界的门把手了。",
  },
  {
    title: "李白与永王案",
    subject: "历史",
    content: "李白不是只会写诗的浪漫角色。他晚年卷入永王李璘事件，被流放夜郎，这背后是安史之乱后的政治裂缝。",
    pointsReward: 20,
    baizeComment: "角色的一句台词，也可能牵出一整段真实历史。",
  },
  {
    title: "叶绿体的能量转换",
    subject: "生物",
    content: "绿色植物把光能转成化学能，叶绿体就是这套系统的核心工坊。阳光、水和二氧化碳，会被组织成生命能量。",
    pointsReward: 16,
    baizeComment: "一片叶子，比很多魔法设定都精密。",
  },
  {
    title: "火山气体与酸雨",
    subject: "化学",
    content: "火山释放的二氧化硫会和空气里的水反应，形成酸性物质。酸碱中和，是处理这类问题的重要化学思路。",
    pointsReward: 16,
    baizeComment: "地球发脾气时，分子也在重新排队。",
  },
];

function pickFallbackCard(context?: ScreenContext) {
  const text = `${context?.appName || ""} ${context?.description || ""} ${context?.subjectHint || ""}`.toLowerCase();

  if (text.includes("红石") || text.includes("minecraft") || text.includes("电路") || text.includes("物理")) {
    return fallbackCards[0];
  }
  if (text.includes("李白") || text.includes("历史") || text.includes("王者")) {
    return fallbackCards[1];
  }
  if (text.includes("植物") || text.includes("叶绿体") || text.includes("生物") || text.includes("光合")) {
    return fallbackCards[2];
  }
  if (text.includes("火山") || text.includes("酸雨") || text.includes("化学")) {
    return fallbackCards[3];
  }

  return fallbackCards[Math.floor(Math.random() * fallbackCards.length)];
}

function offlineChatReply(message: string, mode: string) {
  const lower = message.toLowerCase();

  if (!message) {
    return "我在这里，等你告诉我今天想研究什么。";
  }
  if (mode === "wudao") {
    return `悟道模式下我会轻声回答：关于“${message}”，先记住一个小问题，再慢慢想清楚。`;
  }
  if (lower.includes("物理") || lower.includes("电") || lower.includes("红石")) {
    return "物理可以从“能量怎么流动”开始看。红石、电路、光和声音，本质上都在讲信号与能量的传递。";
  }
  if (lower.includes("历史") || lower.includes("李白")) {
    return "历史不要只背结论。先问：谁在做决定？当时有什么压力？后来造成了什么后果？这样就活起来了。";
  }
  if (lower.includes("生物") || lower.includes("植物")) {
    return "生物学最有意思的是结构和功能的关系。比如叶绿体不是装饰，它负责把光变成生命可用的能量。";
  }
  if (lower.includes("化学") || lower.includes("火山")) {
    return "化学像是在看微小粒子的换位舞台。酸、碱、气体和沉淀，都是物质重新组合后的表现。";
  }

  return "我听见了。我们可以把这个问题拆成“现象、原因、例子、结论”四步。";
}

app.get("/api/health", (_req, res) => {
  const providers = getProviderStatus();
  const activeProvider = providers.find((provider) => provider.configured);
  res.json({
    status: "ok",
    hasGeminiKey: hasGeminiKey(),
    hasAiProvider: Boolean(activeProvider),
    model: activeProvider ? `${activeProvider.label} / ${activeProvider.model}` : null,
    mode: activeProvider ? "ai-ready" : "local-mvp",
    providers,
  });
});

app.post("/api/baize/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  const mode = String(req.body?.mode || "wudao");

  try {
    const result = await generateChatReply(message, mode);

    return res.json({
      text: result.text,
      isMock: false,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("AI chat failed:", error);
    return res.json({
      text: offlineChatReply(message, mode),
      isMock: true,
      aiError: "AI 暂时不可用，已切回本地回复。",
    });
  }
});

app.post("/api/baize/perceive", async (req, res) => {
  const context: ScreenContext = req.body?.context || {};

  if (!hasGeminiKey()) {
    return res.json({ ...pickFallbackCard(context), isMock: true });
  }

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents:
        "请根据这个手机画面场景，为孩子生成一张学习卡片。" +
        `应用：${context.appName || "未知"}。` +
        `画面描述：${context.description || "无"}。` +
        `学科倾向：${context.subjectHint || "自动判断"}。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            content: { type: Type.STRING },
            pointsReward: { type: Type.INTEGER },
            baizeComment: { type: Type.STRING },
          },
          required: ["title", "subject", "content", "pointsReward", "baizeComment"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}") as InsightCard;
    return res.json({ ...parsed, isMock: false });
  } catch (error) {
    console.error("Gemini perceive failed:", error);
    return res.json({
      ...pickFallbackCard(context),
      isMock: true,
      aiError: "AI 暂时不可用，已切回本地卡片。",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      appType: "spa",
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Baize mobile prototype running at http://localhost:${port}`);
  });
}

startServer();
