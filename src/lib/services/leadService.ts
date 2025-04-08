import { Lead, Message, MessageWithLead } from '../types';
import { supabaseService } from './supabaseService';

export const leadService = {
  // Lead operations
  getLeads: async (): Promise<Lead[]> => {
    return supabaseService.getLeads();
  },

  getLead: async (id: string): Promise<Lead> => {
    return supabaseService.getLead(id);
  },

  // Message operations
  getMessages: async (status?: Message['status']): Promise<MessageWithLead[]> => {
    return supabaseService.getMessages(status);
  },

  approveMessage: async (messageId: string): Promise<void> => {
    return supabaseService.approveMessage(messageId);
  },

  rejectMessage: async (messageId: string): Promise<void> => {
    return supabaseService.rejectMessage(messageId);
  },

  scheduleMessage: async (messageId: string, scheduledFor: Date): Promise<void> => {
    return supabaseService.scheduleMessage(messageId, scheduledFor);
  },
}; 