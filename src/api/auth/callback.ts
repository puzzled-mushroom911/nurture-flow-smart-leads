import { Request, Response } from 'express';
import axios from 'axios';
import { supabase } from '../../integrations/supabase/client';

export const callbackHandler = async (req: Request, res: Response) => {
  try {
    const { code, state, locationId } = req.query;

    // Verify state
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('location_id')
      .eq('state', state)
      .single();

    if (stateError || !stateData) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://services.leadconnectorhq.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      redirect_uri: process.env.OAUTH_REDIRECT_URI
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Store tokens in database
    await supabase
      .from('ghl_installations')
      .upsert({
        location_id: locationId,
        access_token,
        refresh_token,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });

    // Clean up used state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    res.redirect('/dashboard?success=true');
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect('/dashboard?error=oauth_failed');
  }
}; 