import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../integrations/supabase/client';

export const authorizeHandler = async (req: Request, res: Response) => {
  try {
    const state = uuidv4();
    const { locationId } = req.query;

    // Store state in database
    await supabase
      .from('oauth_states')
      .insert({ state, location_id: locationId });

    // Construct authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      redirect_uri: process.env.OAUTH_REDIRECT_URI || '',
      client_id: process.env.CLIENT_ID || '',
      scope: [
        'conversations/message.readonly',
        'conversations/message.write',
        'contacts.write',
        'locations.readonly'
      ].join(' '),
      state,
      loginWindowOpenMode: 'self'
    });

    const authUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?${params}`;
    res.redirect(authUrl);
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Failed to initiate authorization' });
  }
}; 