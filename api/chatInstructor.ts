import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { ChatHistoryEntry } from '../types';

const modelName = 'gemini-2.5-flash';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }
  return new GoogleGenAI({ apiKey });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { message, history } = req.body as { message?: string; history?: ChatHistoryEntry[] };

  if (!message?.trim()) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  try {
    const gemini = getGeminiClient();
    const chat = gemini.chats.create({
      model: modelName,
      messages: history || [],
      config: {
        systemInstruction: `
          You are a Kenyan NTSA Driving Instructor AI. 
          Your goal is to help students pass their exams and drive safely in Kenya.
          
          RULES:
          1. IF the user asks about anything NOT related to driving, cars, traffic rules, or road safety, respond ONLY with: "Sorry, please ask about driving only."
          2. Keep answers SHORT and SUMMARIZED. Max 3-4 sentences unless a list is needed.
          3. Use simple English.
        `,
      },
    });

    const result = await chat.sendMessage({ message });
    const reply = result.text || "I didn't catch that. Could you repeat?";

    return res.json({ success: true, data: { reply } });
  } catch (error) {
    console.error('Chat Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to reach the instructor. Please try again.' });
  }
}

