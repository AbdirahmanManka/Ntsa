import { Request, Response } from 'express';
import { Schema, Type } from '@google/genai';
import { gemini, modelName } from './geminiClient';
import { fail, ok } from './utils';
import { QuizQuestion, QuizResponse } from '../../../types';

export const generateQuizHandler = async (req: Request, res: Response) => {
  const { topic, difficulty } = req.body as { topic?: string; difficulty?: 'easy' | 'hard' };

  if (!topic?.trim()) {
    return fail(res, 400, 'topic is required');
  }

  const safeDifficulty = difficulty === 'hard' ? 'hard' : 'easy';

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        correctAnswerIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING },
      },
      required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
      propertyOrdering: ['question', 'options', 'correctAnswerIndex', 'explanation'],
    },
  };

  const prompt = `
    Generate 5 ${safeDifficulty} multiple-choice questions about "${topic}" based on NTSA Kenya curriculum.
    Options should be short.
    Explanation should be 1 sentence.
  `;

  try {
    const response = await gemini.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const jsonText = response.text || '[]';
    const questions = JSON.parse(jsonText) as QuizQuestion[];

    return ok<QuizResponse>(res, { questions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return fail(res, 500, 'Unable to generate quiz questions');
  }
};

