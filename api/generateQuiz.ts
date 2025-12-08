import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { QuizQuestion } from '../types';

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

  const { topic, difficulty } = req.body as { topic?: string; difficulty?: 'easy' | 'hard' };

  if (!topic?.trim()) {
    return res.status(400).json({ success: false, error: 'topic is required' });
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
    const gemini = getGeminiClient();
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

    return res.json({ success: true, data: { questions } });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ success: false, error: 'Unable to generate quiz questions' });
  }
}

