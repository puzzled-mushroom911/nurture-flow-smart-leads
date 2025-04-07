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
    
    if (!code) {
      throw new Error("Missing authorization code from GoHighLevel");
    }
    
    if (!GHL_CLIENT_ID || !GHL_CLIENT_SECRET) {
      console.error("GoHighLevel credentials not found. Available env vars:", Object.keys(Deno.env.toObject()));
      throw new Error("GoHighLevel credentials not configured");
    }

    console.log(`Received callback with code: ${code}`);
    
    // Fix: Change the token exchange to use application/x-www-form-urlencoded format
    const formData = new URLSearchParams();
    formData.append("client_id", GHL_CLIENT_ID);
    formData.append("client_secret", GHL_CLIENT_SECRET);
    formData.append("grant_type", "authorization_code");
    formData.append("code", code);
    formData.append("redirect_uri", REDIRECT_URI);
    
    // Exchange code for access token using form-urlencoded content type
    const tokenResponse = await fetch(GHL_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });
    
    if (!tokenResponse.ok) {
      const contentType = tokenResponse.headers.get("content-type") || "";
      let errorText;
      
      if (contentType.includes("application/json")) {
        errorText = JSON.stringify(await tokenResponse.json());
      } else {
        // Handle HTML or other non-JSON responses
        errorText = await tokenResponse.text();
        // Limit the size of the error text to avoid overwhelming logs
        errorText = errorText.length > 200 
          ? errorText.substring(0, 200) + "... [truncated]" 
          : errorText;
        
        // Look for common patterns in error responses
        if (errorText.includes("DOCTYPE") || errorText.includes("<html")) {
          errorText = "Received HTML response instead of JSON. Check if the redirect URI is properly configured in GoHighLevel.";
        }
      }
      
      console.error("Token exchange error:", errorText);
      console.error("Response status:", tokenResponse.status);
      console.error("Response headers:", Object.fromEntries(tokenResponse.headers.entries()));
      throw new Error(`Failed to exchange code for token. Status: ${tokenResponse.status}. Error: ${errorText}`);
    }
    
    // Parse the response carefully
    let tokenData;
    try {
      tokenData = await tokenResponse.json();
      console.log("Received token response:", JSON.stringify(tokenData));
    } catch (e) {
      console.error("Error parsing token response:", e);
      const textResponse = await tokenResponse.text();
      throw new Error(`Invalid JSON in token response: ${textResponse.substring(0, 200)}`);
    }
    
    const { access_token, refresh_token, expires_in, locationId, companyId } = tokenData;
    
    if (!access_token || !refresh_token) {
      throw new Error("Invalid token response from GoHighLevel: Missing required tokens");
    }
    
    // If locationId and companyId are not included in the token response, fetch the current location
    let finalLocationId = locationId;
    let finalCompanyId = companyId;
    
    if (!finalLocationId || !finalCompanyId) {
      console.log("Location and company ID not provided in token response, fetching from API");
      const locationResponse = await fetch(`${GHL_API_URL}/locations/v1/location`, {
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        }
      });
      
      if (!locationResponse.ok) {
        const errorText = await locationResponse.text();
        console.error("Error fetching location data:", errorText);
        throw new Error(`Failed to retrieve location information. Status: ${locationResponse.status}`);
      }
      
      let locationData;
      try {
        locationData = await locationResponse.json();
        console.log("Location data:", JSON.stringify(locationData));
      } catch (e) {
        console.error("Error parsing location response:", e);
        throw new Error("Failed to parse location data as JSON");
      }
      
      if (locationData && locationData.location) {
        finalLocationId = locationData.location.id;
        finalCompanyId = locationData.location.companyId;
        
        if (!finalLocationId || !finalCompanyId) {
          throw new Error("Could not determine location and company IDs from response");
        }
      } else {
        throw new Error("Invalid location data response from GoHighLevel");
      }
    }
    
    // Calculate token expiration date
    const token_expires_at = new Date();
    token_expires_at.setSeconds(token_expires_at.getSeconds() + expires_in);
    
    // Store the installation in Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
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
