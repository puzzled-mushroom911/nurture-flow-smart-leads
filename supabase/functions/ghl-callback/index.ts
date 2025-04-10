import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  location_id: string;
}

interface OAuthError {
  error: string;
  error_description?: string;
}

// GHL OAuth callback endpoint
app.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error, error_description);
      const errorMessage = typeof error_description === 'string' ? error_description : typeof error === 'string' ? error : 'Unknown error';
      return res.redirect(`${process.env.FRONTEND_URL}/oauth/error?message=${encodeURIComponent(errorMessage)}`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/oauth/error?message=${encodeURIComponent('Missing required parameters')}`);
    }

    // Validate state parameter
    if (typeof state !== 'string' || !state.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      return res.redirect(`${process.env.FRONTEND_URL}/oauth/error?message=${encodeURIComponent('Invalid state parameter')}`);
    }

    // Exchange code for access token
    const tokenResponse = await axios.post<TokenResponse>('https://services.leadconnectorhq.com/oauth/token', {
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.GHL_REDIRECT_URI
    });

    const { access_token, refresh_token, expires_in, location_id } = tokenResponse.data;

    // Store tokens in Supabase
    const { error: dbError } = await supabase
      .from('ghl_installations')
      .upsert({
        user_id: state,
        location_id,
        access_token,
        refresh_token,
        token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Error storing tokens:', dbError);
      return res.redirect(`${process.env.FRONTEND_URL}/oauth/error?message=${encodeURIComponent('Failed to store tokens')}`);
    }

    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL}/oauth/success`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.redirect(`${process.env.FRONTEND_URL}/oauth/error?message=${encodeURIComponent(errorMessage)}`);
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
