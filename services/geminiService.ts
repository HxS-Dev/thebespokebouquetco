import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFloralAdvice = async (userMessage: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      You are "Flora", the AI concierge for The Bespoke Bouquet Co.
      Your tone is elegant, helpful, and knowledgeable about flowers.
      You help customers choose bouquets based on occasions, seasons, and sentiments.
      Keep responses concise (under 80 words) and polite.
      If asked about prices, give a general range ($60 - $150).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I apologize, I am currently rearranging the shop. Please ask again in a moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I am having trouble connecting to the garden right now. Please try again later.";
  }
};
