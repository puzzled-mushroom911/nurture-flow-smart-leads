import { NextApiRequest, NextApiResponse } from 'next';
import { ghlService } from '@/lib/services/ghlService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.query;

    if (!code || !state || Array.isArray(code) || Array.isArray(state)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    await ghlService.handleOAuthCallback(code, state);
    res.redirect('/dashboard?integration=success');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.redirect('/dashboard?integration=error');
  }
} 