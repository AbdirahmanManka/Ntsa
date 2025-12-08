import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { chatInstructorHandler } from './app/api/chatInstructor';
import { generateTopicHandler } from './app/api/generateTopic';
import { generateQuizHandler } from './app/api/generateQuiz';
import { searchHandler } from './app/api/search';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
const port = process.env.PORT || 8788;
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:8788',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Backend running 🚀' });
});

app.post('/api/chatInstructor', chatInstructorHandler);
app.post('/api/generateTopic', generateTopicHandler);
app.post('/api/generateQuiz', generateQuizHandler);
app.post('/api/search', searchHandler);

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});

