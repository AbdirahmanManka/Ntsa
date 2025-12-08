import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ path: '.env.production', override: true });

export const getEnv = () => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing. Add it to your environment (.env/.env.local/.env.production).');
  }

  return {
    GEMINI_API_KEY,
  };
};

