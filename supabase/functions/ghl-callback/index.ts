import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = "https://vxgvmmudspqwsaedcmsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z3ZtbXVkc3Bxd3NhZWRjbXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODk4MzgsImV4cCI6MjA1OTU2NTgzOH0.wSYR4wG-jL2ZjYsluabFRGQKqtajPFhWrqE8QAd0YXw";
const GHL_CLIENT_ID = Deno.env.get("GHL_CLIENT_ID");
const GHL_CLIENT_SECRET = Deno.env.get("GHL_CLIENT_SECRET");
const GHL_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token";
const REDIRECT_URI = "https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/oauth-callback";
const FRONTEND_URL = "https://preview--nurture-flow-smart-leads.lovable.app";

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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const locationId = url.searchParams.get("locationId");
    const companyId = url.searchParams.get("companyId");
    
    if (!code || !locationId || !companyId) {
      throw new Error("Missing required parameters from GoHighLevel");
    }
    
    if (!GHL_CLIENT_ID || !GHL_CLIENT_SECRET) {
      throw new Error("GoHighLevel credentials not configured");
    }

    console.log(`Received callback with code for location ${locationId} in company ${companyId}`);
    
    // Exchange code for access token
    const tokenResponse = await fetch(GHL_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: GHL_CLIENT_ID,
        client_secret: GHL_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange error:", errorText);
      throw new Error(`Failed to exchange code for token: ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log("Received token response:", JSON.stringify(tokenData));
    
    const { access_token, refresh_token, expires_in } = tokenData;
    
    if (!access_token || !refresh_token) {
      throw new Error("Invalid token response from GoHighLevel");
    }
    
    // Calculate token expiration date
    const token_expires_at = new Date();
    token_expires_at.setSeconds(token_expires_at.getSeconds() + expires_in);
    
    // Store the installation in Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase
      .from('ghl_installations')
      .upsert({
        company_id: companyId,
        location_id: locationId,
        access_token,
        refresh_token,
        token_expires_at: token_expires_at.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_id,location_id'
      })
      .select();
    
    if (error) {
      console.error("Error storing installation:", error);
      throw new Error(`Failed to store installation: ${error.message}`);
    }
    
    console.log("Installation stored successfully:", data);
    
    // Redirect back to frontend with success message
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": `${FRONTEND_URL}/settings?integration=success&location=${locationId}`
      }
    });
    
  } catch (error) {
    console.error("Error in GoHighLevel OAuth callback:", error);
    // Redirect back to frontend with error message
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": `${FRONTEND_URL}/settings?integration=error&message=${encodeURIComponent(error.message)}`
      }
    });
  }
});
