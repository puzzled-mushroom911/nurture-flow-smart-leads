import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadService } from '@/lib/services/leadService';
import { MessageWithLead } from '@/lib/types';

export const useLeads = () => {
  const queryClient = useQueryClient();

  // Combined query for all messages
  const allMessages = useQuery({
    queryKey: ['messages'],
    queryFn: () => leadService.getMessages(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Derived states from the main query
  const pendingMessages = {
    ...allMessages,
    data: allMessages.data?.filter(m => m.status === 'pending'),
  };

  const scheduledMessages = {
    ...allMessages,
    data: allMessages.data?.filter(m => m.status === 'scheduled'),
  };

  const sentMessages = {
    ...allMessages,
    data: allMessages.data?.filter(m => m.status === 'sent'),
  };

  const rejectedMessages = {
    ...allMessages,
    data: allMessages.data?.filter(m => m.status === 'rejected'),
  };

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

  return {
    pendingMessages,
    scheduledMessages,
    sentMessages,
    rejectedMessages,
    approveMessage,
    rejectMessage,
    scheduleMessage,
  };
}; 