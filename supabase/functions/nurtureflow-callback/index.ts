
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = "https://vxgvmmudspqwsaedcmsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z3ZtbXVkc3Bxd3NhZWRjbXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODk4MzgsImV4cCI6MjA1OTU2NTgzOH0.wSYR4wG-jL2ZjYsluabFRGQKqtajPFhWrqE8QAd0YXw";
// Fix: Try both possible environment variable names to maintain compatibility
const GHL_CLIENT_ID = Deno.env.get("GHL_CLIENT_ID") || Deno.env.get("GHL_Client_ID");
const GHL_CLIENT_SECRET = Deno.env.get("GHL_CLIENT_SECRET") || Deno.env.get("GHL_Client_Secret");
// Fix: Update to the correct OAuth token URL
const GHL_TOKEN_URL = "https://marketplace.gohighlevel.com/oauth/token";
const GHL_API_URL = "https://services.leadconnectorhq.com";
const REDIRECT_URI = "https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/nurtureflow-callback";
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
    const state = url.searchParams.get("state");
    
    console.log("Received callback request with URL params:", { code: code ? "present" : "missing", state });
    
    if (!code) {
      console.error("Missing authorization code from GoHighLevel");
      throw new Error("Missing authorization code from GoHighLevel");
    }
    
    if (!GHL_CLIENT_ID || !GHL_CLIENT_SECRET) {
      console.error("GoHighLevel credentials not found. Available env vars:", Object.keys(Deno.env.toObject()));
      throw new Error("GoHighLevel credentials not configured");
    }

    console.log(`Received callback with code: ${code.substring(0, 5)}...`);
    
    // Fix: Change the token exchange to use application/x-www-form-urlencoded format
    const formData = new URLSearchParams();
    formData.append("client_id", GHL_CLIENT_ID);
    formData.append("client_secret", GHL_CLIENT_SECRET);
    formData.append("grant_type", "authorization_code");
    formData.append("code", code);
    formData.append("redirect_uri", REDIRECT_URI);
    
    // Exchange code for access token using form-urlencoded content type
    console.log("Sending token exchange request to:", GHL_TOKEN_URL);
    
    try {
      const tokenResponse = await fetch(GHL_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      
      console.log("Token response status:", tokenResponse.status);
      
      // Important: Check if response was successful before attempting to read body
      if (!tokenResponse.ok) {
        const contentType = tokenResponse.headers.get("content-type") || "";
        let errorData;
        
        if (contentType.includes("application/json")) {
          errorData = await tokenResponse.json();
          console.error("Token exchange error (JSON):", JSON.stringify(errorData));
        } else {
          // Handle HTML or other non-JSON responses
          const errorText = await tokenResponse.text();
          console.error("Token exchange error (text):", errorText.substring(0, 200));
          if (errorText.includes("DOCTYPE") || errorText.includes("<html")) {
            throw new Error("Received HTML response. Check if redirect URI is properly configured in GoHighLevel.");
          } else {
            throw new Error(`Failed to exchange code for token. Status: ${tokenResponse.status}`);
          }
        }
        
        throw new Error(`Token exchange failed with status: ${tokenResponse.status}`);
      }
      
      // Parse JSON response only once and store the result
      const tokenData = await tokenResponse.json();
      console.log("Received token response:", JSON.stringify({
        access_token: tokenData.access_token ? "present" : "missing",
        refresh_token: tokenData.refresh_token ? "present" : "missing",
        expires_in: tokenData.expires_in,
        locationId: tokenData.locationId,
        companyId: tokenData.companyId
      }));
      
      const { access_token, refresh_token, expires_in, locationId, companyId } = tokenData;
      
      if (!access_token || !refresh_token) {
        throw new Error("Invalid token response from GoHighLevel: Missing required tokens");
      }
      
      // If locationId and companyId are not included in the token response, fetch the current location
      let finalLocationId = locationId;
      let finalCompanyId = companyId;
      
      if (!finalLocationId || !finalCompanyId) {
        console.log("Location and company ID not provided in token response, fetching from API");
        
        try {
          const locationResponse = await fetch(`${GHL_API_URL}/locations/v1/location`, {
            headers: {
              "Authorization": `Bearer ${access_token}`,
              "Content-Type": "application/json",
            }
          });
          
          if (!locationResponse.ok) {
            const locationErrorText = await locationResponse.text();
            console.error("Error fetching location data:", locationErrorText);
            throw new Error(`Failed to retrieve location information. Status: ${locationResponse.status}`);
          }
          
          const locationData = await locationResponse.json();
          console.log("Location data:", JSON.stringify(locationData));
          
          if (locationData && locationData.location) {
            finalLocationId = locationData.location.id;
            finalCompanyId = locationData.location.companyId;
            
            if (!finalLocationId || !finalCompanyId) {
              throw new Error("Could not determine location and company IDs from response");
            }
            
            console.log("Retrieved location and company IDs:", { finalLocationId, finalCompanyId });
          } else {
            throw new Error("Invalid location data response from GoHighLevel");
          }
        } catch (locationError) {
          console.error("Error during location fetch:", locationError);
          throw locationError;
        }
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
          company_id: finalCompanyId,
          location_id: finalLocationId,
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
          "Location": `${FRONTEND_URL}/settings?integration=success&location=${finalLocationId}`
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
