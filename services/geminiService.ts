import {
  ApiResponse,
  ChatHistoryEntry,
  ChatInstructorResponse,
  QuizQuestion,
  QuizResponse,
  SearchResponse,
  TopicContentResponse,
} from '../types';

// Use relative paths for Vercel deployment - works both locally (via proxy) and in production
const fetchJson = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success || !json.data) {
    throw new Error(json.error || 'Unexpected API error');
  }

  return json.data;
};

export const generateTopicContent = async (topicTitle: string): Promise<string> => {
  const data = await fetchJson<TopicContentResponse>('/api/generateTopic', {
    method: 'POST',
    body: JSON.stringify({ topicTitle }),
    });
  return data.content;
};

export const chatWithInstructor = async (
  message: string,
  history: ChatHistoryEntry[],
): Promise<string> => {
  const data = await fetchJson<ChatInstructorResponse>('/api/chatInstructor', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
  return data.reply;
};

export const generateQuizQuestions = async (
  topic: string,
  difficulty: 'easy' | 'hard',
): Promise<QuizQuestion[]> => {
  const data = await fetchJson<QuizResponse>('/api/generateQuiz', {
    method: 'POST',
    body: JSON.stringify({ topic, difficulty }),
  });
  return data.questions;
};

export const searchTopics = async (query: string): Promise<string> => {
  const data = await fetchJson<SearchResponse>('/api/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
    });
  return data.results;
};