
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = "https://vxgvmmudspqwsaedcmsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z3ZtbXVkc3Bxd3NhZWRjbXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODk4MzgsImV4cCI6MjA1OTU2NTgzOH0.wSYR4wG-jL2ZjYsluabFRGQKqtajPFhWrqE8QAd0YXw";
const GHL_CLIENT_ID = Deno.env.get("GHL_CLIENT_ID") || Deno.env.get("GHL_Client_ID");
const GHL_CLIENT_SECRET = Deno.env.get("GHL_CLIENT_SECRET") || Deno.env.get("GHL_Client_Secret");
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
    
    console.log("Received callback request with URL params:", { 
      code: code ? "present" : "missing", 
      locationId, 
      companyId 
    });
    
    if (!code || !locationId || !companyId) {
      console.error("Missing required parameters from GoHighLevel");
      throw new Error("Missing required parameters from GoHighLevel");
    }
    
    if (!GHL_CLIENT_ID || !GHL_CLIENT_SECRET) {
      console.error("GoHighLevel credentials not found. Available env vars:", Object.keys(Deno.env.toObject()));
      throw new Error("GoHighLevel credentials not configured");
    }

    console.log(`Received callback with code for location ${locationId} in company ${companyId}`);
    
    // Exchange code for access token
    console.log("Sending token exchange request to:", GHL_TOKEN_URL);
    
    try {
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
      
      console.log("Token response status:", tokenResponse.status);
      
      if (!tokenResponse.ok) {
        const contentType = tokenResponse.headers.get("content-type") || "";
        let errorMessage = `Failed to exchange code for token. Status: ${tokenResponse.status}`;
        
        try {
          if (contentType.includes("application/json")) {
            const errorData = await tokenResponse.json();
            errorMessage = `API Error: ${JSON.stringify(errorData)}`;
            console.error("Token exchange error (JSON):", errorMessage);
          } else {
            // For HTML or other responses, just get a snippet of text
            const errorText = await tokenResponse.text();
            const snippet = errorText.substring(0, 200) + (errorText.length > 200 ? '...' : '');
            errorMessage = `Received non-JSON response. First 200 chars: ${snippet}`;
            console.error("Token exchange error (non-JSON):", errorMessage);
            
            if (errorText.includes("DOCTYPE") || errorText.includes("<html")) {
              throw new Error("Received HTML response. Check if redirect URI and credentials are properly configured.");
            }
          }
        } catch (parseError) {
          errorMessage = `Error parsing response: ${parseError.message}`;
          console.error("Error parsing response:", parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse the token data safely
      let tokenData;
      try {
        const responseText = await tokenResponse.text();
        try {
          tokenData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse token response as JSON:", responseText.substring(0, 200));
          throw new Error(`Failed to parse token response as JSON: ${parseError.message}`);
        }
      } catch (textError) {
        console.error("Error reading token response body:", textError);
        throw new Error(`Error reading token response: ${textError.message}`);
      }
      
      console.log("Received token response:", JSON.stringify({
        access_token: tokenData.access_token ? "present" : "missing",
        refresh_token: tokenData.refresh_token ? "present" : "missing",
        expires_in: tokenData.expires_in
      }));
      
      const { access_token, refresh_token, expires_in } = tokenData;
      
      if (!access_token || !refresh_token) {
        throw new Error("Invalid token response from GoHighLevel: Missing required tokens");
      }
      
      // Calculate token expiration date
      const token_expires_at = new Date();
      token_expires_at.setSeconds(token_expires_at.getSeconds() + expires_in);
      
      // Store the installation in Supabase
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      console.log("Storing installation in database...");
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
      
    } catch (tokenError) {
      console.error("Token exchange error:", tokenError);
      throw tokenError;
    }
    
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
