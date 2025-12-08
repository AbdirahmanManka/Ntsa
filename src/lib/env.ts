// Note: dotenv.config() should be called in the entry point (src/server.ts) before this module is imported
// This file only reads from process.env, it does not load dotenv files

export const getEnv = () => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing. Current env keys:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')));
    throw new Error('GEMINI_API_KEY is missing. Add it to your .env.local or .env file.');
  }

  return {
    GEMINI_API_KEY,
  };
};

