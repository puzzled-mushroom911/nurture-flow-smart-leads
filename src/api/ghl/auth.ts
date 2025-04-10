import { Request, Response } from 'express';
import { ghlService } from '@/lib/services/ghlService';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const authUrl = await ghlService.startOAuthFlow(userId);
    res.status(200).json({ url: authUrl });
  } catch (error) {
    console.error('Error starting OAuth flow:', error);
    res.status(500).json({ error: 'Failed to start OAuth flow' });
  }
} 