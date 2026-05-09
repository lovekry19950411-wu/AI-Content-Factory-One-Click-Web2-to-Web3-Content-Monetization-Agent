# AI Video Studio - Technical Stack & Build Plan

## 🚀 專案介紹
這是一個基於 AI 的一站式影音生產平台。透過 Google Gemini 2.0 模型，自動完成從腳本撰寫、視覺提示詞生成到字幕與配音文稿的影音製作全流程。

## 🛠 技術棧 (Tech Stack)
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 (Elegant Dark Theme)
- **Animation**: Motion (framer-motion)
- **AI Engine**: Google Gemini 2.0 Flash (via `@google/generative-ai`)
- **Icons**: Lucide React

## 📂 安裝與運行
1. **導出專案**: 在 AI Studio 設定選單中選擇「Export to ZIP」。
2. **安裝依賴**: 
   ```bash
   npm install
   ```
3. **啟動開發服務器**:
   ```bash
   npm run dev
   ```
4. **構建生產版本**:
   ```bash
   npm run build
   ```

## 💰 變現路徑 (Monetization Path)
1. **SaaS 訂閱**: 提供 Tier 1 (腳本生成) 到 Tier 3 (自動剪輯工作流) 的訂閱服務。
2. **MCN 內容產量包**: 為短影音創作者提供大批量、矩陣化的爆款影片策劃。
3. **API 轉售**: 集成如 Luma AI 或 Runway 的 Video API，提供整套影音生成服務。

## 🔑 環境變量 (ENV 設置)
你需要申請以下密鑰並填入 `.env` 文件：
- **GEMINI_API_KEY**: 從 [Google AI Studio](https://aistudio.google.com/) 獲取。
- **VIDEO_SERVICE_KEY**: (可選) 連結渲染引擎如 Luma/Runway。
- **TTS_SERVICE_KEY**: (可選) 連結高品質配音服務。
