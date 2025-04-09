export interface Lead {
  id: string;
  ghl_contact_id: string;
  installation_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  tags: string[] | null;
  last_activity: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  lead_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'sent';
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageWithLead extends Message {
  lead: Lead;
} 