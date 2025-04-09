import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadService } from '@/lib/services/leadService';
import { MessageWithLead } from '@/lib/types';

export const useLeads = () => {
  const queryClient = useQueryClient();

  // Separate queries for each message status
  const pendingMessages = useQuery({
    queryKey: ['messages', 'pending'],
    queryFn: () => leadService.getMessages('pending'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const scheduledMessages = useQuery({
    queryKey: ['messages', 'scheduled'],
    queryFn: () => leadService.getMessages('scheduled'),
    staleTime: 5 * 60 * 1000,
  });

  const sentMessages = useQuery({
    queryKey: ['messages', 'sent'],
    queryFn: () => leadService.getMessages('sent'),
    staleTime: 5 * 60 * 1000,
  });

  const rejectedMessages = useQuery({
    queryKey: ['messages', 'rejected'],
    queryFn: () => leadService.getMessages('rejected'),
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const approveMessage = useMutation({
    mutationFn: (messageId: string) => leadService.approveMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const rejectMessage = useMutation({
    mutationFn: (messageId: string) => leadService.rejectMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const scheduleMessage = useMutation({
    mutationFn: ({ messageId, scheduledFor }: { messageId: string; scheduledFor: Date }) =>
      leadService.scheduleMessage(messageId, scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const generateMessages = useMutation({
    mutationFn: () => leadService.generateMessages(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const refreshMessages = useMutation({
    mutationFn: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ['messages', 'pending'] }),
      queryClient.invalidateQueries({ queryKey: ['messages', 'scheduled'] }),
      queryClient.invalidateQueries({ queryKey: ['messages', 'sent'] }),
      queryClient.invalidateQueries({ queryKey: ['messages', 'rejected'] }),
    ]),
  });

  return {
    pendingMessages,
    scheduledMessages,
    sentMessages,
    rejectedMessages,
    approveMessage,
    rejectMessage,
    scheduleMessage,
    generateMessages,
    refreshMessages,
  };
}; 