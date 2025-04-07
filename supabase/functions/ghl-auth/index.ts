
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const REDIRECT_URI = "https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/ghl-callback";
const GHL_AUTH_URL = "https://marketplace.gohighlevel.com/oauth/chooselocation";
const GHL_CLIENT_ID = Deno.env.get("GHL_CLIENT_ID");

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
      throw new Error("GoHighLevel Client ID not configured");
    }

    const state = crypto.randomUUID();
    
    // Construct the authorization URL
    const authorizationUrl = `${GHL_AUTH_URL}?response_type=code&client_id=${GHL_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=contacts/readonly conversations/readonly opportunities/readonly campaigns/readonly&state=${state}`;
    
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
