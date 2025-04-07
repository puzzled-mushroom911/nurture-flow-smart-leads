
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = "https://vxgvmmudspqwsaedcmsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z3ZtbXVkc3Bxd3NhZWRjbXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODk4MzgsImV4cCI6MjA1OTU2NTgzOH0.wSYR4wG-jL2ZjYsluabFRGQKqtajPFhWrqE8QAd0YXw";
const GHL_CLIENT_ID = Deno.env.get("GHL_CLIENT_ID");
const GHL_CLIENT_SECRET = Deno.env.get("GHL_CLIENT_SECRET");
// Fix: Update to the correct OAuth token URL
const GHL_TOKEN_URL = "https://marketplace.gohighlevel.com/oauth/token";

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
    if (!GHL_CLIENT_ID || !GHL_CLIENT_SECRET) {
      throw new Error("GoHighLevel credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const body = await req.json();
    const { installation_id } = body;
    
    if (!installation_id) {
      throw new Error("Missing installation_id parameter");
    }

    // Get the installation
    const { data: installation, error: installationError } = await supabase
      .from("ghl_installations")
      .select("*")
      .eq("id", installation_id)
      .single();

    if (installationError || !installation) {
      throw new Error(`Installation not found: ${installationError?.message || "No data"}`);
    }

    // Check if token needs refresh (expires within 10 minutes)
    const expiresAt = new Date(installation.token_expires_at);
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    
    if (expiresAt > tenMinutesFromNow) {
      console.log("Token still valid, no refresh needed");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Token still valid" 
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    
    console.log("Refreshing token for installation:", installation_id);

    // Fix: Update to use application/x-www-form-urlencoded content type
    const formData = new URLSearchParams();
    formData.append("client_id", GHL_CLIENT_ID);
    formData.append("client_secret", GHL_CLIENT_SECRET);
    formData.append("grant_type", "refresh_token");
    formData.append("refresh_token", installation.refresh_token);

    // Refresh the token with form-urlencoded content type
    const tokenResponse = await fetch(GHL_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token refresh error:", errorText);
      throw new Error(`Failed to refresh token: ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;
    
    // Calculate new expiration date
    const token_expires_at = new Date();
    token_expires_at.setSeconds(token_expires_at.getSeconds() + expires_in);
    
    // Update the installation
    const { error: updateError } = await supabase
      .from("ghl_installations")
      .update({
        access_token,
        refresh_token,
        token_expires_at: token_expires_at.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", installation_id);
    
    if (updateError) {
      throw new Error(`Failed to update installation: ${updateError.message}`);
    }
    
    console.log("Token refreshed successfully for installation:", installation_id);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Token refreshed successfully" 
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
    
  } catch (error) {
    console.error("Error refreshing token:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
