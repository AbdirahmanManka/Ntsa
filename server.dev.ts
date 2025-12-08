import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

// Import Vercel handlers
import chatInstructorHandler from './api/chatInstructor';
import generateTopicHandler from './api/generateTopic';
import generateQuizHandler from './api/generateQuiz';
import searchHandler from './api/search';
import healthHandler from './api/health';

const app = express();
const port = 8788;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Wrapper to convert Express req/res to Vercel format
const wrapHandler = (handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) => {
  return async (req: express.Request, res: express.Response) => {
    try {
      // VercelRequest and Express Request are compatible enough
      const vercelReq = req as unknown as VercelRequest;
      const vercelRes = res as unknown as VercelResponse;
      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  };
};

// Register routes
app.get('/api/health', wrapHandler(healthHandler));
app.post('/api/chatInstructor', wrapHandler(chatInstructorHandler));
app.post('/api/generateTopic', wrapHandler(generateTopicHandler));
app.post('/api/generateQuiz', wrapHandler(generateQuizHandler));
app.post('/api/search', wrapHandler(searchHandler));

app.listen(port, () => {
  console.log(`🚀 Local API server running on http://localhost:${port}`);
  console.log(`📝 Make sure GEMINI_API_KEY is set in .env.local`);
});

