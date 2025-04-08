export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  lead_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'sent';
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageWithLead extends Message {
  lead: Lead;
} 