import { supabase } from '@/integrations/supabase/client';
import { Lead, Message, MessageWithLead } from '../types';

export const supabaseService = {
  // Lead operations
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getLead(id: string): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Lead not found');
    return data;
  },

  // Message operations
  async getMessages(status?: Message['status']): Promise<MessageWithLead[]> {
    let query = supabase
      .from('messages')
      .select(`
        *,
        lead:leads(*)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      lead: item.lead as Lead
    }));
  },

  async approveMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) throw error;
  },

  async rejectMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) throw error;
  },

  async scheduleMessage(messageId: string, scheduledFor: Date): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ 
        status: 'scheduled',
        scheduled_for: scheduledFor.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) throw error;
  },

  async editMessage(messageId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) throw error;
  },

  async generateMessages(): Promise<void> {
    // Call the Supabase function to generate messages
    const { error } = await supabase.functions.invoke('generate-messages', {
      body: { action: 'generate' }
    });

    if (error) throw error;
  }
}; 