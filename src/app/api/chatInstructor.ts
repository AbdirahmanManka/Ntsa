import { Request, Response } from 'express';
import { gemini, modelName } from './geminiClient';
import { fail, ok } from './utils';
import { ChatHistoryEntry, ChatInstructorResponse } from '../../../types';

export const chatInstructorHandler = async (req: Request, res: Response) => {
  const { message, history } = req.body as { message?: string; history?: ChatHistoryEntry[] };

  if (!message?.trim()) {
    return fail(res, 400, 'Message is required');
  }

  try {
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

    return ok<ChatInstructorResponse>(res, { reply });
  } catch (error) {
    console.error('Chat Error:', error);
    return fail(res, 500, 'Failed to reach the instructor. Please try again.');
  }
};

