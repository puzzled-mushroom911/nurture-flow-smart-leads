import { Request, Response } from 'express';
import { ghlService } from '@/lib/services/ghlService';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code || !state) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    await ghlService.handleOAuthCallback(code, state);
    res.redirect('/dashboard?integration=success');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.redirect('/dashboard?integration=error');
  }
} 