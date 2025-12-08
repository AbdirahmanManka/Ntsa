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

  const { topicTitle } = req.body as { topicTitle?: string };

  if (!topicTitle?.trim()) {
    return res.status(400).json({ success: false, error: 'topicTitle is required' });
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
    const gemini = getGeminiClient();
    const response = await gemini.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: 'You are a helpful, concise driving instructor.',
      },
    });

    const content = response.text || 'Failed to load content. Please try again.';

    return res.json({ success: true, data: { content } });
  } catch (error) {
    console.error('Gemini topic error:', error);
    return res.status(500).json({ success: false, error: 'Error generating topic content' });
  }
}

