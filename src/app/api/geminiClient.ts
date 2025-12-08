import { GoogleGenAI } from '@google/genai';
import { getEnv } from '../../lib/env';

export const modelName = 'gemini-2.5-flash';

// Lazy initialization - only create client when first accessed
let _gemini: GoogleGenAI | null = null;

const getGemini = (): GoogleGenAI => {
  if (!_gemini) {
    const { GEMINI_API_KEY } = getEnv();
    _gemini = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
  }
  return _gemini;
};

// Export as Proxy to forward all property access lazily
export const gemini = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    return getGemini()[prop as keyof GoogleGenAI];
  },
});

