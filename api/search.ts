import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

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

  const { query } = req.body as { query?: string };

  if (!query?.trim()) {
    return res.status(400).json({ success: false, error: 'query is required' });
  }

  const prompt = `
    Search query: "${query}" regarding Kenyan Driving Rules.
    Provide a direct, summarized answer with bullet points.
    Cite specific NTSA rules if applicable.
    Keep it under 150 words.
  `;

  try {
    const gemini = getGeminiClient();
    const response = await gemini.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const results = response.text || 'No results found.';
    return res.json({ success: true, data: { results } });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, error: 'Search unavailable' });
  }
}

