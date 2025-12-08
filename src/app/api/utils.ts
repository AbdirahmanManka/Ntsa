import { Response } from 'express';

export const ok = <T>(res: Response, data: T) => res.json({ success: true, data });

export const fail = (res: Response, status: number, error: string) =>
  res.status(status).json({ success: false, error });

