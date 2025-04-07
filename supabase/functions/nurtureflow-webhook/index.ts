
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = "https://vxgvmmudspqwsaedcmsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z3ZtbXVkc3Bxd3NhZWRjbXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODk4MzgsImV4cCI6MjA1OTU2NTgzOH0.wSYR4wG-jL2ZjYsluabFRGQKqtajPFhWrqE8QAd0YXw";
const GHL_WEBHOOK_SECRET = Deno.env.get("GHL_WEBHOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook signature if available
    const signature = req.headers.get("x-ghl-signature");
    if (GHL_WEBHOOK_SECRET && signature) {
      // In a production app, you would verify the signature here
      // using the GHL_WEBHOOK_SECRET
    }

    // Parse webhook payload
    const payload = await req.json();
    console.log("Received GoHighLevel webhook:", JSON.stringify(payload));

    if (!payload.companyId || !payload.locationId) {
      throw new Error("Missing companyId or locationId in webhook payload");
    }

    // Store webhook event in Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // First, find the installation ID
    const { data: installation, error: installationError } = await supabase
      .from("ghl_installations")
      .select("id")
      .eq("company_id", payload.companyId)
      .eq("location_id", payload.locationId)
      .single();

    if (installationError || !installation) {
      console.error("Installation not found for webhook:", installationError);
      throw new Error(`Installation not found for company ${payload.companyId} and location ${payload.locationId}`);
    }

    // Determine event type from payload
    let eventType = "unknown";
    if (payload.type === "contact") {
      eventType = payload.contact ? "contact_created" : "contact_deleted";
      if (payload.contact && payload.oldContact) {
        eventType = "contact_updated";
      }
    }

    // Store the webhook event
    const { data, error } = await supabase
      .from("webhook_events")
      .insert({
        installation_id: installation.id,
        event_type: eventType,
        payload: payload,
      });

    if (error) {
      console.error("Error storing webhook event:", error);
      throw new Error(`Failed to store webhook event: ${error.message}`);
    }

    console.log("Webhook event stored successfully");

    // Process contact events synchronously (for demo purposes)
    if (eventType === "contact_created" && payload.contact) {
      await processNewContact(supabase, installation.id, payload.contact);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

async function processNewContact(supabase, installationId, contact) {
  try {
    // Extract contact data
    const { id, firstName, lastName, email, phone, tags } = contact;
    
    // Insert new lead
    const { data, error } = await supabase
      .from("leads")
      .upsert({
        installation_id: installationId,
        ghl_contact_id: id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        tags: tags,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "installation_id,ghl_contact_id"
      });
    
    if (error) {
      console.error("Error storing lead from contact:", error);
      throw new Error(`Failed to store lead: ${error.message}`);
    }
    
    console.log("Lead processed successfully from contact webhook");
  } catch (error) {
    console.error("Error processing contact:", error);
  }
}
