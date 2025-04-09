import { supabase } from '@/integrations/supabase/client';

interface GHLInstallation {
  id: string;
  user_id?: string;
  location_id: string;
  company_id: string;
  location_name?: string;
  company_name?: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  scope?: string;
  created_at: string;
  updated_at: string;
}

interface GHLConnection {
  connected: boolean;
  location?: {
    id: string;
    name: string;
  };
  company?: {
    id: string;
    name: string;
  };
  lastConnected?: string;
}

export const ghlService = {
  /**
   * Check if the current user has a GoHighLevel connection
   */
  async getConnectionStatus(): Promise<GHLConnection> {
    try {
      console.log('Checking GHL connection status...');
      
      type InstallationResponse = {
        id: string;
        location_id: string;
        company_id: string;
        location_name?: string;
        company_name?: string;
        created_at: string;
      };

      const { data: installations, error } = await supabase
        .from('ghl_installations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching GHL installation:', error.message);
        throw error;
      }
      
      if (!installations || installations.length === 0) {
        console.log('No GHL installation found');
        return { connected: false };
      }
      
      // Get the most recent installation
      const installation = installations[0];
      console.log('Found GHL installation:', installation.id);
      const typedInstallation = installation as unknown as InstallationResponse;
      
      return {
        connected: true,
        location: {
          id: typedInstallation.location_id,
          name: typedInstallation.location_name || 'Unknown Location',
        },
        company: {
          id: typedInstallation.company_id,
          name: typedInstallation.company_name || 'Unknown Company',
        },
        lastConnected: typedInstallation.created_at,
      };
    } catch (error) {
      console.error('Error checking GHL connection:', error);
      return { connected: false };
    }
  },

  /**
   * Get all installations for the current user
   */
  async getInstallations(): Promise<GHLInstallation[]> {
    const { data, error } = await supabase
      .from('ghl_installations')
      .select('*');
    
    if (error) throw error;
    return (data || []) as unknown as GHLInstallation[];
  },

  /**
   * Initiate the OAuth flow
   */
  startOAuthFlow() {
    // Redirect to the Supabase Edge function that handles the OAuth init
    window.location.href = 'https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/nurtureflow-auth';
  },

  /**
   * Disconnect a GoHighLevel integration
   */
  async disconnectIntegration(installationId: string): Promise<void> {
    const { error } = await supabase
      .from('ghl_installations')
      .delete()
      .eq('id', installationId);
    
    if (error) throw error;
  }
}; 