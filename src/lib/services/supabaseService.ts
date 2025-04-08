import { createClient } from '@supabase/supabase-js';
import { Lead, Message, MessageWithLead } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  }
}; 