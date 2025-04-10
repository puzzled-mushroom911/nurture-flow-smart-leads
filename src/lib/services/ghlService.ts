import { supabase } from '@/integrations/supabase/client';
import axios from 'axios';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  location_id: string;
}

interface GHLInstallation {
  id: string;
  user_id: string;
  location_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
  state?: string;
  company_id?: string;
}

interface GHLConnection {
  connected: boolean;
  location?: {
    id: string;
    name: string;
  };
  lastConnected?: string;
}

export class GHLService {
  private static instance: GHLService;
  private baseURL = 'https://services.leadconnectorhq.com';
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  private constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GHL_CLIENT_ID || '';
    this.clientSecret = process.env.GHL_CLIENT_SECRET || '';
    this.redirectUri = process.env.NEXT_PUBLIC_GHL_REDIRECT_URI || '';
  }

  public static getInstance(): GHLService {
    if (!GHLService.instance) {
      GHLService.instance = new GHLService();
    }
    return GHLService.instance;
  }

  async startOAuthFlow(userId: string): Promise<string> {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Supabase URL is not configured');
      }

      if (!this.clientId) {
        throw new Error('GoHighLevel Client ID is not configured');
      }

      const state = crypto.randomUUID();
      
      // Store state in Supabase for validation
      const { error: dbError } = await supabase
        .from('ghl_installations')
        .upsert({
          user_id: userId,
          state,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Partial<GHLInstallation>);

      if (dbError) {
        throw new Error('Failed to store OAuth state');
      }

      const params = new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        state,
        scope: 'contacts.readonly contacts.write'
      });

      return `https://marketplace.gohighlevel.com/oauth/chooselocation?${params.toString()}`;
    } catch (error) {
      console.error('Error starting OAuth flow:', error);
      throw error;
    }
  }

  async handleOAuthCallback(code: string, state: string): Promise<void> {
    try {
      if (!code || !state) {
        throw new Error('Missing required parameters');
      }

      // Validate state parameter
      if (!state.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        throw new Error('Invalid state parameter');
      }

      // Verify state in database
      const { data: installation, error: dbError } = await supabase
        .from('ghl_installations')
        .select('user_id')
        .eq('state', state)
        .single();

      if (dbError || !installation) {
        throw new Error('Invalid or expired OAuth state');
      }

      // Exchange code for tokens
      const response = await axios.post<TokenResponse>('https://services.leadconnectorhq.com/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri
      });

      const { access_token, refresh_token, expires_in, location_id } = response.data;

      // Update installation with tokens
      const { error: updateError } = await supabase
        .from('ghl_installations')
        .update({
          access_token,
          refresh_token,
          token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          location_id,
          state: null, // Clear state after successful authentication
          updated_at: new Date().toISOString()
        } as Partial<GHLInstallation>)
        .eq('state', state);

      if (updateError) {
        throw new Error('Failed to update installation with tokens');
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }

  private async getAccessToken(installationId: string): Promise<string> {
    const { data: installation, error } = await supabase
      .from('ghl_installations')
      .select('*')
      .eq('id', installationId)
      .single();

    if (error || !installation) {
      throw new Error('Installation not found');
    }

    // Check if token needs refresh
    const expiresAt = new Date(installation.token_expires_at);
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    if (expiresAt <= tenMinutesFromNow) {
      const newTokens = await this.refreshToken(installation.refresh_token);
      await this.updateInstallationTokens(installationId, newTokens);
      return newTokens.access_token;
    }

    return installation.access_token;
  }

  private async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await axios.post<TokenResponse>(
      `${this.baseURL}/oauth/token`,
      new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  private async updateInstallationTokens(installationId: string, tokens: TokenResponse): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    const { error } = await supabase
      .from('ghl_installations')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      } as Partial<GHLInstallation>)
      .eq('id', installationId);

    if (error) {
      throw error;
    }
  }

  public async getConnectionStatus(): Promise<GHLConnection> {
    try {
      const { data: installations, error } = await supabase
        .from('ghl_installations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !installations || installations.length === 0) {
        return { connected: false };
      }

      const installation = installations[0] as GHLInstallation;
      return {
        connected: true,
        location: {
          id: installation.location_id,
          name: 'Location ' + installation.location_id,
        },
        lastConnected: installation.created_at,
      };
    } catch (error) {
      console.error('Error checking GHL connection:', error);
      return { connected: false };
    }
  }

  public async getInstallations(): Promise<GHLInstallation[]> {
    const { data, error } = await supabase
      .from('ghl_installations')
      .select('*');

    if (error) throw error;
    return data as GHLInstallation[];
  }

  public async disconnectIntegration(installationId: string): Promise<void> {
    const { error } = await supabase
      .from('ghl_installations')
      .delete()
      .eq('id', installationId);

    if (error) throw error;
  }

  public async makeRequest(installationId: string, method: string, endpoint: string, data?: any) {
    const accessToken = await this.getAccessToken(installationId);

    const response = await axios({
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data,
    });

    return response.data;
  }
}

export const ghlService = GHLService.getInstance(); 