import { GoogleGenAI } from '@google/genai';
import { getEnv } from '../../lib/env';

const { GEMINI_API_KEY } = getEnv();

export const modelName = 'gemini-2.5-flash';

export const gemini = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

