import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = "https://vxgvmmudspqwsaedcmsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z3ZtbXVkc3Bxd3NhZWRjbXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODk4MzgsImV4cCI6MjA1OTU2NTgzOH0.wSYR4wG-jL2ZjYsluabFRGQKqtajPFhWrqE8QAd0YXw";
// Fix: Try both possible environment variable names to maintain compatibility
const GHL_CLIENT_ID = Deno.env.get("GHL_CLIENT_ID") || Deno.env.get("GHL_Client_ID");
const GHL_CLIENT_SECRET = Deno.env.get("GHL_CLIENT_SECRET") || Deno.env.get("GHL_Client_Secret");
// IMPORTANT: This is the correct OAuth token URL for GoHighLevel
const GHL_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token";
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
    
    // Exchange code for access token using JSON format (not form-urlencoded)
    console.log("Sending token exchange request to:", GHL_TOKEN_URL);
    
    try {
      const tokenResponse = await fetch(GHL_TOKEN_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: GHL_CLIENT_ID,
          client_secret: GHL_CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI
        }).toString()
      });
      
      console.log("Token response status:", tokenResponse.status);
      
      // Important: Check if response was successful before attempting to read body
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
              throw new Error("Received HTML response. Check if redirect URI and credentials are properly configured in GoHighLevel.");
            }
          }
        } catch (parseError) {
          errorMessage = `Error parsing response: ${parseError.message}`;
          console.error("Error parsing response:", parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse JSON response only once and store the result
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
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
      
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
