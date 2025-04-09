import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/lib/services/contactService';
import { Lead } from '@/lib/types';

export const useContacts = () => {
  const queryClient = useQueryClient();

  // Get all contacts
  const contacts = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactService.getContacts(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Import contacts mutation
  const importContacts = useMutation({
    mutationFn: () => contactService.importContacts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  // Force import contacts mutation (will work even without GHL connection)
  const forceImportContacts = useMutation({
    mutationFn: () => contactService.forceImportContacts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  // Search contacts mutation
  const searchContacts = useMutation({
    mutationFn: (query: string) => contactService.searchContacts(query),
  });

  return {
    contacts,
    importContacts,
    forceImportContacts,
    searchContacts,
  };
}; 