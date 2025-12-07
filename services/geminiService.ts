import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIWordInfo } from "../types";

// Helper to get client safely
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * 使用 Gemini 生成单词详情（释义、例句、音标）
 */
export const fetchWordDetails = async (term: string): Promise<AIWordInfo> => {
  const ai = getClient();
  
  const systemInstruction = `
    你是一个专业的英语词汇老师。请为用户提供的英语单词生成详细的学习卡片信息。
    要求：
    1. definition: 简明扼要的中文释义（不超过20字）。
    2. phonetic: IPA音标。
    3. exampleSentence: 一个地道、实用的英文例句（难度适中）。
    4. exampleTranslation: 例句的中文翻译。
    5. tags: 1-3个标签，如 "商务", "生活", "学术", "动词" 等。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Please explain the word: "${term}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            definition: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
            exampleTranslation: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["definition", "phonetic", "exampleSentence", "exampleTranslation", "tags"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIWordInfo;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * 使用 Gemini TTS 生成发音
 */
export const fetchWordAudio = async (text: string): Promise<ArrayBuffer> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Audio generation failed");
    }

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;

  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};
