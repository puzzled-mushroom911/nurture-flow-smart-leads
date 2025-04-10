import axios, { AxiosError, AxiosResponse } from 'axios';
import { supabase } from '../../integrations/supabase/client';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

interface GHLInstallation {
  id: string;
  location_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
  company_id: string;
}

export class IntegrationService {
  private static instance: IntegrationService;
  private baseUrl = 'https://services.leadconnectorhq.com';

  private constructor() {}

  public static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  private extractRateLimitInfo(headers: any): RateLimitInfo {
    return {
      limit: parseInt(headers['x-ratelimit-limit'] || '0'),
      remaining: parseInt(headers['x-ratelimit-remaining'] || '0'),
      reset: parseInt(headers['x-ratelimit-reset'] || '0')
    };
  }

  private async refreshToken(locationId: string): Promise<string> {
    const { data: installation, error } = await supabase
      .from('ghl_installations')
      .select('*')
      .eq('location_id', locationId)
      .single();

    if (error || !installation) {
      throw new Error('Failed to fetch installation data');
    }

    const ghlInstallation = installation as GHLInstallation;
    const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GHL_CLIENT_ID,
        client_secret: process.env.GHL_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: ghlInstallation.refresh_token,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('ghl_installations')
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_expires_at: expiresAt,
      })
      .eq('location_id', locationId);

    if (updateError) {
      throw new Error('Failed to update installation data');
    }

    return data.access_token;
  }

  private async getValidToken(locationId: string): Promise<string> {
    const { data: installation, error } = await supabase
      .from('ghl_installations')
      .select('*')
      .eq('location_id', locationId)
      .single();

    if (error || !installation) {
      throw new Error('Failed to fetch installation data');
    }

    const ghlInstallation = installation as GHLInstallation;
    const expiresAt = new Date(ghlInstallation.token_expires_at);
    const now = new Date();

    // Refresh token if it's about to expire (within 5 minutes)
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      return this.refreshToken(locationId);
    }

    return ghlInstallation.access_token;
  }

  public async makeRequest<T>(
    locationId: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const token = await this.getValidToken(locationId);
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await axios.request<T>({
        method,
        url,
        headers: {
          Authorization: `Bearer ${token}`,
          Version: '2021-07-28',
          Accept: 'application/json'
        },
        data
      });

      const rateLimit = this.extractRateLimitInfo(response.headers);
      if (rateLimit.remaining === 0) {
        const waitTime = rateLimit.reset - Math.floor(Date.now() / 1000);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        return this.makeRequest<T>(locationId, method, endpoint, data);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 429) {
          const retryAfter = parseInt(axiosError.response.headers['retry-after'] || '60');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return this.makeRequest<T>(locationId, method, endpoint, data);
        }
        throw new Error(`API request failed: ${axiosError.message}`);
      }
      throw error;
    }
  }
} 