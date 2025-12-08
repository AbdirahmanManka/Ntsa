import { Request, Response } from 'express';
import { gemini, modelName } from './geminiClient';
import { fail, ok } from './utils';
import { TopicContentResponse } from '../../../types';

export const generateTopicHandler = async (req: Request, res: Response) => {
  const { topicTitle } = req.body as { topicTitle?: string };

  if (!topicTitle?.trim()) {
    return fail(res, 400, 'topicTitle is required');
  }

  const prompt = `
    You are an expert Kenyan NTSA Driving Instructor.
    Create a study guide for the topic: "${topicTitle}".
    
    Requirements:
    1. STRICTLY summarized, short content. No long paragraphs.
    2. Use bullet points extensively.
    3. Highlight key terms in **bold**.
    4. Provide 2-3 real-world Kenyan driving examples (e.g., using Nairobi roads, matatus, local context).
    5. Tone: Beginner-friendly, encouraging, easy to skim.
    6. Structure:
       - 🎯 Quick Summary (1-2 sentences)
       - 🔑 Key Rules/Points (Bulleted list)
       - 🇰🇪 Kenyan Context Examples
       - ⚠️ Common Mistakes to Avoid

    Return the response in Markdown format.
  `;

  try {
    const response = await gemini.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: 'You are a helpful, concise driving instructor.',
      },
    });

    const content = response.text || 'Failed to load content. Please try again.';

    return ok<TopicContentResponse>(res, { content });
  } catch (error) {
    console.error('Gemini topic error:', error);
    return fail(res, 500, 'Error generating topic content');
  }
};

