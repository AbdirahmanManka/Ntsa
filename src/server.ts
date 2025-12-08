import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Load environment variables FIRST before any other imports
// dotenv.config() looks for .env in the current working directory
// Load .env.local with override to take precedence
dotenv.config(); // Loads .env
dotenv.config({ path: '.env.local', override: true }); // Overrides with .env.local if exists

// Verify API key is loaded (helpful for debugging)
if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
  console.error('⚠️  WARNING: GEMINI_API_KEY not found in environment variables!');
  console.error('   Please create a .env.local file in the project root with:');
  console.error('   GEMINI_API_KEY=your_actual_api_key_here');
  console.error('   Current working directory:', process.cwd());
} else {
  console.log('✅ GEMINI_API_KEY loaded successfully');
}

import { chatInstructorHandler } from './app/api/chatInstructor';
import { generateTopicHandler } from './app/api/generateTopic';
import { generateQuizHandler } from './app/api/generateQuiz';
import { searchHandler } from './app/api/search';

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

