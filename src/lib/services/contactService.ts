import { supabaseService, supabase } from './supabaseService';
import { Lead } from '../types';

export const contactService = {
  // Get all contacts
  getContacts: async (): Promise<Lead[]> => {
    return supabaseService.getLeads();
  },

  // Import contacts from GoHighLevel
  importContacts: async (useForce = false): Promise<void> => {
    try {
      console.log('Starting import contacts request', useForce ? '(force mode)' : '');
      
      // Call the Supabase function to import contacts
      const { data, error } = await supabase.functions.invoke('import-contacts', {
        body: { action: 'import' },
        ...(useForce ? { 
          queryParams: { force: 'true' } 
        } : {})
      });

      if (error) {
        console.error('Error from import-contacts function:', error);
        throw error;
      }

      if (!data || !data.success) {
        console.error('Import contacts function returned unsuccessful response:', data);
        throw new Error(data?.error || 'Import failed with unknown error');
      }

      console.log('Import contacts successful:', data);
    } catch (error) {
      console.error('Error importing contacts:', error);
      throw error;
    }
  },

  // Force import contacts (will create dummy data if no connection)
  forceImportContacts: async (): Promise<void> => {
    return contactService.importContacts(true);
  },

  // Search contacts
  searchContacts: async (query: string): Promise<Lead[]> => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}; 