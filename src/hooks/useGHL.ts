import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ghlService } from '@/lib/services/ghlService';

export const useGHL = () => {
  const queryClient = useQueryClient();

  // Query to get connection status
  const connectionStatus = useQuery({
    queryKey: ['ghl-connection'],
    queryFn: () => ghlService.getConnectionStatus(),
    staleTime: 30 * 1000, // Cache for 30 seconds (reduced from 5 minutes)
    retry: 1, // Only retry once if there's an error
  });

  // Query to get installations
  const installations = useQuery({
    queryKey: ['ghl-installations'],
    queryFn: () => ghlService.getInstallations(),
    staleTime: 30 * 1000, // Cache for 30 seconds (reduced from 5 minutes)
    retry: 1, // Only retry once if there's an error
  });

  // Mutation to disconnect an integration
  const disconnectIntegration = useMutation({
    mutationFn: (installationId: string) => ghlService.disconnectIntegration(installationId),
    onSuccess: () => {
      // Invalidate both queries after a successful disconnect
      queryClient.invalidateQueries({ queryKey: ['ghl-connection'] });
      queryClient.invalidateQueries({ queryKey: ['ghl-installations'] });
    },
  });

  // Function to manually refresh connection status
  const refreshConnection = () => {
    queryClient.invalidateQueries({ queryKey: ['ghl-connection'] });
    queryClient.invalidateQueries({ queryKey: ['ghl-installations'] });
  };

  // Function to start the OAuth flow
  const connectGHL = () => {
    ghlService.startOAuthFlow();
  };

  return {
    connectionStatus,
    installations,
    disconnectIntegration,
    connectGHL,
    refreshConnection,
  };
}; 