import { Request, Response } from 'express';
import { gemini, modelName } from './geminiClient';
import { fail, ok } from './utils';
import { SearchResponse } from '../../../types';

export const searchHandler = async (req: Request, res: Response) => {
  const { query } = req.body as { query?: string };

  if (!query?.trim()) {
    return fail(res, 400, 'query is required');
  }

  const prompt = `
    Search query: "${query}" regarding Kenyan Driving Rules.
    Provide a direct, summarized answer with bullet points.
    Cite specific NTSA rules if applicable.
    Keep it under 150 words.
  `;

  try {
    const response = await gemini.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const results = response.text || 'No results found.';
    return ok<SearchResponse>(res, { results });
  } catch (error) {
    console.error('Search error:', error);
    return fail(res, 500, 'Search unavailable');
  }
};

