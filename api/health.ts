import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  return res.json({ success: true, message: 'Backend running 🚀' });
}

