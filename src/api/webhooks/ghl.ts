import { Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Define interface for webhook events
interface GHLWebhookEvent {
  event: string;
  locationId: string;
  companyId: string;
  contactId?: string;
  opportunityId?: string;
  campaignId?: string;
  data: Record<string, any>;
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-ghl-signature'] as string;
    const webhookSecret = process.env.GHL_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const computedSignature = hmac
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      // If signatures don't match, return 401
      if (signature !== computedSignature) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Process the webhook event
    const event = req.body as GHLWebhookEvent;
    console.log('Received GHL webhook event:', event.event);

    // Store the webhook event for auditing
    await storeWebhookEvent(event);

    // Handle different event types
    switch (event.event) {
      case 'contact.created':
      case 'contact.updated':
        await handleContactEvent(event);
        break;
      case 'opportunity.created':
      case 'opportunity.updated':
      case 'opportunity.deleted':
        await handleOpportunityEvent(event);
        break;
      // Add more event types as needed
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    // Acknowledge receipt of the webhook
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}

// Store webhook event in database
async function storeWebhookEvent(event: GHLWebhookEvent) {
  const { error } = await supabase
    .from('webhook_events')
    .insert({
      event_type: event.event,
      installation_id: await getInstallationId(event.locationId),
      payload: event as unknown as Json,
      processed: false
    });

  if (error) {
    console.error('Error storing webhook event:', error);
  }
}

// Get installation ID from location ID
async function getInstallationId(locationId: string): Promise<string> {
  const { data, error } = await supabase
    .from('ghl_installations')
    .select('id')
    .eq('location_id', locationId)
    .single();

  if (error || !data) {
    console.error(`No installation found for location ${locationId}`);
    throw new Error(`No installation found for location ${locationId}`);
  }

  return data.id;
}

// Handle contact-related events
async function handleContactEvent(event: GHLWebhookEvent) {
  if (!event.contactId || !event.data) return;

  const installationId = await getInstallationId(event.locationId);
  const contact = event.data;
  
  // Insert or update lead in the database
  const { error } = await supabase
    .from('leads')
    .upsert({
      installation_id: installationId,
      ghl_contact_id: event.contactId,
      email: contact.email,
      phone: contact.phone,
      first_name: contact.firstName,
      last_name: contact.lastName,
      status: 'new', // Default status for new leads
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error storing lead:', error);
  }
}

// Handle opportunity-related events
async function handleOpportunityEvent(event: GHLWebhookEvent) {
  if (!event.opportunityId || !event.data) return;
  
  // Store the opportunity event for later processing
  console.log(`Processing opportunity ${event.opportunityId} for event ${event.event}`);
  
  // For now, we'll just store the raw event in webhook_events table
  // Actual opportunity processing logic will be implemented later
} 