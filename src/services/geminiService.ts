import { GoogleGenAI } from "@google/genai";

export type ContentType = "video_script" | "visual_prompt" | "subtitle_gen" | "ai_edit_plan" | "voiceover_text";
export type Platform = "youtube" | "tiktok" | "instagram" | "bilibili" | "shorts";

export interface GeneratedContent {
  id: string;
  type: ContentType;
  platform: Platform;
  topic: string;
  content: string;
  timestamp: number;
  wordCount: number;
}

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const generateViralContent = async (
  type: ContentType,
  platform: Platform,
  topic: string,
  extraInstructions?: string
) => {
  const ai = getAI();
  
  const prompts: Record<string, string> = {
    video_script: `為 ${platform} 平台策劃一個專業級影音腳本。話題：${topic}。要求：包含詳細的鏡頭描述 (Shot List)、情緒曲線、對話文稿、背景音樂 (BGM) 建議。`,
    visual_prompt: `為 AI 影片生成引擎 (Luma AI / Runway Gen-3) 編寫高品質視覺提示詞。話題：${topic}。要求：使用英文描述專業燈光、攝影機運動 (Pan, Tilt, Crane)、電影級質感、4K 解析度。`,
    subtitle_gen: `為話題 "${topic}" 生成具備行銷心理學的社交媒體字幕。要求：包含 Header、Body 和 Call-to-Action (CTA)，適合短影音快速瀏覽。`,
    ai_edit_plan: `為話題 "${topic}" 提供一份專業剪輯流程指南。包含進場動畫類型、節奏切換點建議、色調 (Color Grading) 風格以及 AI 轉場效果應用。`,
    voiceover_text: `編寫一段專為 AI配音 (TTS) 優化的文稿。話題：${topic}。要求：語句流暢、節奏感強，區分強調語氣與停頓感。`
  };

  const finalPrompt = `${prompts[type]} 發布平台：${platform}。額外要求：${extraInstructions || "無"}。請直接輸出文案內容，不要帶有引言。`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: finalPrompt,
    config: {
      systemInstruction: "Output exactly the generated response logic."
    }
  });
  
  if (!response.text) {
    throw new Error("No content generated");
  }
  
  return response.text;
};

export const generateImagePrompt = async (sceneDescription: string) => {
  const ai = getAI();
  const prompt = `Convert the following video scene description into a high-quality, descriptive visual prompt for an AI image generator (like Flux or Midjourney). Focus on lighting, camera angle, texture, and cinematic style. Description: ${sceneDescription}. Output ONLY the prompt in English.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  if (!response.text) {
    throw new Error("No content generated");
  }
  
  return response.text;
};

export const generateAdvice = async (history: { role: string; parts: { text: string }[] }[]) => {
  const ai = getAI();
  const lastMessage = history[history.length - 1].parts[0].text;
  
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: { systemInstruction: "You are a helpful assistant." }
  });
  
  const response = await chat.sendMessage({ 
    message: JSON.stringify(history.slice(0, -1)) + "\nNew Message: " + lastMessage 
  });
  
  if (!response.text) {
    throw new Error("No content generated");
  }
  
  return response.text;
};
