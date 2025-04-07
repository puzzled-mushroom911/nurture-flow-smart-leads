
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const REDIRECT_URI = "https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/nurtureflow-callback";
const GHL_AUTH_URL = "https://marketplace.gohighlevel.com/oauth/chooselocation";
// Fix: Use correct case for environment variables to match what's in Supabase
const GHL_CLIENT_ID = Deno.env.get("GHL_CLIENT_ID") || Deno.env.get("GHL_Client_ID");

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
    if (!GHL_CLIENT_ID) {
      console.error("GoHighLevel Client ID not found. Available env vars:", Object.keys(Deno.env.toObject()));
      throw new Error("GoHighLevel Client ID not configured");
    }

    const state = crypto.randomUUID();
    
    // Fix: Update scopes to valid ones, without spaces between them
    // Valid scopes from GHL documentation: locations/readonly, contacts, opportunities, conversations, campaigns
    const authorizationUrl = `${GHL_AUTH_URL}?response_type=code&client_id=${GHL_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=locations/readonly+contacts+conversations+opportunities+campaigns&state=${state}`;
    
    console.log(`Redirecting to GoHighLevel authorization: ${authorizationUrl}`);
    
    // Redirect to GoHighLevel OAuth page
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": authorizationUrl
      }
    });
  } catch (error) {
    console.error("Error initiating GoHighLevel OAuth:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
