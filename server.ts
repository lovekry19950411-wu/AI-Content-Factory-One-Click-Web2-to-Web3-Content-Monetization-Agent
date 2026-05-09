import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Schema
const scriptSchema = new mongoose.Schema({
  id: String,
  type: String,
  platform: String,
  topic: String,
  content: String,
  timestamp: Number,
  wordCount: Number
});

const Script = mongoose.model("Script", scriptSchema);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Connect to MongoDB if URI is provided
  const mongodbUri = process.env.MONGODB_URI;
  if (mongodbUri) {
    try {
      await mongoose.connect(mongodbUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("Connected to MongoDB Atlas");
    } catch (err: any) {
      console.error("CRITICAL: MongoDB connection error!");
      console.error("Reason:", err.message);
      if (err.name === 'MongooseServerSelectionError') {
        console.error("GUIDANCE: This usually means your IP address is NOT whitelisted in MongoDB Atlas.");
        console.error("To fix this:");
        console.error("1. Go to cloud.mongodb.com");
        console.error("2. Go to 'Network Access'");
        console.error("3. Click 'Add IP Address'");
        console.error("4. Select 'Allow Access From Anywhere' (0.0.0.0/0)");
      } else if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
        console.error("GUIDANCE: Authentication failed! Please check your MongoDB password.");
        console.error("Important: DO NOT include the '<' and '>' characters in your password.");
        console.error("Correct format: mongodb+srv://username:myPassword123@cluster...");
        console.error("Incorrect format: mongodb+srv://username:<myPassword123>@cluster...");
      }
    }
  } else {
    console.warn("MONGODB_URI not provided. Skipping database connection.");
  }

  // API Routes
  app.get("/api/scripts", async (req, res) => {
    try {
      const scripts = await Script.find().sort({ timestamp: -1 });
      res.json(scripts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch scripts" });
    }
  });

  app.post("/api/scripts", async (req, res) => {
    try {
      const newScript = new Script(req.body);
      await newScript.save();
      res.status(201).json(newScript);
    } catch (err) {
      res.status(500).json({ error: "Failed to save script" });
    }
  });

  app.delete("/api/scripts/:id", async (req, res) => {
    try {
      await Script.deleteOne({ id: req.params.id });
      res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete script" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
