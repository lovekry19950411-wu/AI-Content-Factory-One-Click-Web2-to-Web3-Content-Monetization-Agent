import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// MongoDB Schema
const scriptSchema = new mongoose.Schema({
  id: String,
  userAddress: String,
  type: String,
  platform: String,
  topic: String,
  content: String,
  timestamp: Number,
  wordCount: Number
});

const userSchema = new mongoose.Schema({
  address: { type: String, unique: true },
  credits: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  invitedBy: String,
  invitesCount: { type: Number, default: 0 },
  createdAt: { type: Number, default: Date.now }
});

const Script = mongoose.model("Script", scriptSchema);
const User = mongoose.model("User", userSchema);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Connect to MongoDB if URI is provided
  const mongodbUri = process.env.MONGODB_URI;
  if (mongodbUri) {
    mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    }).then(() => {
      console.log("Connected to MongoDB Atlas");
    }).catch((err: any) => {
      console.error("CRITICAL: MongoDB connection error!");
      console.error("Reason:", err.message);
    });
  } else {
    console.warn("MONGODB_URI not provided. Skipping database connection.");
  }

  // User Routes
  const fallbackUsers: Record<string, any> = {};

  app.get("/api/user/:address", async (req, res) => {
    const { address } = req.params;
    try {
      if (mongoose.connection.readyState !== 1) {
        if (!fallbackUsers[address]) {
          const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          fallbackUsers[address] = { address, referralCode, credits: 5, invitesCount: 0 }; // Give some free credits in fallback
        }
        return res.json(fallbackUsers[address]);
      }
      let user = await User.findOne({ address });
      if (!user) {
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        user = new User({ address, referralCode, credits: 0 });
        await user.save();
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/user/:address/refer", async (req, res) => {
    const { address } = req.params;
    const { code } = req.body;
    try {
      if (mongoose.connection.readyState !== 1) {
        const user = fallbackUsers[address];
        if (user && !user.invitedBy && code) {
          const inviter = Object.values(fallbackUsers).find((u: any) => u.referralCode === code);
          if (inviter && inviter.address !== address) {
            user.invitedBy = inviter.address;
            user.credits += 1;
            inviter.invitesCount += 1;
            inviter.credits += 2;
            return res.json({ success: true, message: "Referral applied! Bonus credits added." });
          }
        }
        return res.json({ success: false, message: "Invalid or already applied" });
      }
      const user = await User.findOne({ address });
      if (user && !user.invitedBy && code) {
        const inviter = await User.findOne({ referralCode: code });
        if (inviter && inviter.address !== address) {
          user.invitedBy = inviter.address;
          user.credits += 1; // Bonus for invited user
          await user.save();

          inviter.invitesCount += 1;
          inviter.credits += 2; // Viral Bonus for inviter
          await inviter.save();
          return res.json({ success: true, message: "Referral applied! Bonus credits added." });
        }
      }
      res.json({ success: false, message: "Invalid or already applied" });
    } catch (err) {
      res.status(500).json({ error: "Referral failed" });
    }
  });

  app.post("/api/user/:address/topup", async (req, res) => {
    const { address } = req.params;
    const { amount } = req.body; // number of credits
    try {
      if (mongoose.connection.readyState !== 1) {
        if (fallbackUsers[address]) {
          fallbackUsers[address].credits += amount;
          return res.json(fallbackUsers[address]);
        }
        return res.status(404).json({ error: "User not found" });
      }
      const user = await User.findOne({ address });
      if (user) {
        user.credits += amount;
        await user.save();
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (err) {
      res.status(500).json({ error: "Topup failed" });
    }
  });

  app.post("/api/user/:address/spend", async (req, res) => {
    const { address } = req.params;
    try {
      if (mongoose.connection.readyState !== 1) {
        if (fallbackUsers[address] && fallbackUsers[address].credits > 0) {
          fallbackUsers[address].credits -= 1;
          return res.json({ success: true, credits: fallbackUsers[address].credits });
        }
        return res.status(400).json({ error: "Insufficient credits" });
      }
      const user = await User.findOne({ address });
      if (user && user.credits > 0) {
        user.credits -= 1;
        await user.save();
        res.json({ success: true, credits: user.credits });
      } else {
        res.status(400).json({ error: "Insufficient credits" });
      }
    } catch (err) {
      res.status(500).json({ error: "Spend failed" });
    }
  });

  // AI Generation Route (The core logic for viral-gen)
  app.post("/api/viral-gen", async (req, res) => {
    console.log("AI Generation Request Details:", {
      type: req.body.type,
      platform: req.body.platform,
      topic: req.body.topic
    });

    try {
      const { type, platform, topic, extraInstructions } = req.body;

      if (!apiKey || apiKey.length < 5) {
        console.error("CRITICAL: GEMINI_API_KEY is not configured on the server.");
        return res.status(500).json({ error: "伺服器 AI 金鑰尚未配置。請在環境變數中設置 GEMINI_API_KEY。" });
      }

      const prompts: Record<string, string> = {
        video_script: `為 ${platform} 平台策劃一個專業級影音腳本。話題：${topic}。要求：包含詳細的鏡頭描述 (Shot List)、情緒曲線、對話文稿、背景音樂 (BGM) 建議。`,
        visual_prompt: `為 AI 影片生成引擎 (Luma AI / Runway Gen-3) 編寫高品質視覺提示詞。話題：${topic}。要求：使用英文描述專業燈光、攝影機運動 (Pan, Tilt, Crane)、電影級質感、4K 解析度。`,
        subtitle_gen: `為話題 "${topic}" 生成具備行銷心理學的社交媒體字幕。要求：包含 Header、Body 和 Call-to-Action (CTA)，適合短影音快速瀏覽。`,
        ai_edit_plan: `為話題 "${topic}" 提供一份專業剪輯流程指南。包含進場動畫類型、節奏切換點建議、色調 (Color Grading) 風格以及 AI 轉場效果應用。`,
        voiceover_text: `編寫一段專為 AI配音 (TTS) 優化的文稿。話題：${topic}。要求：語句流暢、節奏感強，區分強調語氣與停頓感。`
      };

      const finalPrompt = `${prompts[type] || prompts.video_script} 發布平台：${platform}。額外要求：${extraInstructions || "無"}。請直接輸出內容，不要帶有引言或結語。`;
      
      console.log("Sending prompt to Gemini (gemini-1.5-flash)...");
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: finalPrompt,
      });
      
      const text = response.text;
      
      if (!text) {
        console.error("Gemini returned empty response");
        return res.status(500).json({ error: "AI 返回了空內容，可能觸發了安全過濾，請更換話題試試。" });
      }

      console.log("Generation successful, sending response back to client.");
      res.send(text); 
    } catch (err: any) {
      console.error("Gemini API Error details:", err);
      if (err.message?.includes("API key not valid")) {
        return res.status(500).json({ error: "AI 金鑰失效或無效，請檢查伺服器配置。可在 Settings > Secrets 重新設置。" });
      }
      res.status(500).json({ error: "AI 生成過程發生錯誤: " + (err.message || "未知錯誤") });
    }
  });

  // API Routes
  const fallbackScripts: any[] = [];

  app.get("/api/scripts", async (req, res) => {
    const address = req.query.address as string;
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.json(fallbackScripts.filter(s => !address || s.userAddress === address).sort((a, b) => b.timestamp - a.timestamp));
      }
      const query = address ? { userAddress: address } : {};
      const scripts = await Script.find(query).sort({ timestamp: -1 });
      res.json(scripts);
    } catch (err) {
      console.error("Fetch Scripts Error:", err);
      res.status(500).json({ error: "Failed to fetch scripts" });
    }
  });

  app.post("/api/scripts", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        fallbackScripts.push(req.body);
        return res.status(201).json(req.body);
      }
      const newScript = new Script(req.body);
      await newScript.save();
      res.status(201).json(newScript);
    } catch (err) {
      res.status(500).json({ error: "Failed to save script" });
    }
  });

  app.delete("/api/scripts/:id", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        const index = fallbackScripts.findIndex(s => s.id === req.params.id);
        if (index > -1) fallbackScripts.splice(index, 1);
        return res.status(200).json({ message: "Deleted successfully" });
      }
      await Script.deleteOne({ id: req.params.id });
      res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete script" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
