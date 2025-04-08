import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ghlService } from '@/lib/services/ghlService';

export const useGHL = () => {
  const queryClient = useQueryClient();

  // Query to get connection status
  const connectionStatus = useQuery({
    queryKey: ['ghl-connection'],
    queryFn: () => ghlService.getConnectionStatus(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Query to get installations
  const installations = useQuery({
    queryKey: ['ghl-installations'],
    queryFn: () => ghlService.getInstallations(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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

  // Function to start the OAuth flow
  const connectGHL = () => {
    ghlService.startOAuthFlow();
  };

  return {
    connectionStatus,
    installations,
    disconnectIntegration,
    connectGHL,
  };
}; 