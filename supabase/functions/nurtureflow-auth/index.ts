import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const REDIRECT_URI = "https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/nurtureflow-callback";
const GHL_AUTH_URL = "https://marketplace.gohighlevel.com/oauth/chooselocation";
// Fix: Use correct case for environment variables to match what's in Supabase
const GHL_CLIENT_ID = Deno.env.get("GHL_CLIENT_ID") || Deno.env.get("GHL_Client_ID") || "67f3402bb0c46a1b8d090311-m96hrsry";

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
    
    // Updated scopes to use the correct format with dots and slashes as provided
    const scopes = [
      "locations.readonly",
      "conversations.readonly",
      "conversations/message.write",
      "contacts.write",
      "opportunities.write",
      "opportunities.readonly"
    ];
    
    // Join scopes with plus signs for URL parameter
    const scopesParam = scopes.join("+");
    
    // Add debug parameters to help diagnose issues
    const authorizationUrl = `${GHL_AUTH_URL}?response_type=code&client_id=${GHL_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scopesParam}&state=${state}&debug=true`;
    
    console.log(`Redirecting to GoHighLevel authorization: ${authorizationUrl}`);
    
    // Redirect to GoHighLevel OAuth page
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": authorizationUrl,
        "Cache-Control": "no-cache, no-store" // Prevent caching issues
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
