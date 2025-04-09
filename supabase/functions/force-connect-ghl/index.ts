import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = "https://vxgvmmudspqwsaedcmsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z3ZtbXVkc3Bxd3NhZWRjbXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODk4MzgsImV4cCI6MjA1OTU2NTgzOH0.wSYR4wG-jL2ZjYsluabFRGQKqtajPFhWrqE8QAd0YXw";
const GHL_CLIENT_ID = "67f3402bb0c46a1b8d090311-m96hrsry";
const GHL_CLIENT_SECRET = "f232bf2c-a0e9-4af4-8f63-0cbc7a074db1";
const GHL_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token";

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
    const locationId = url.searchParams.get("locationId") || "101";
    const companyId = url.searchParams.get("companyId") || "201";
    
    console.log("Manually connecting with provided data:", { locationId, companyId });
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // First check if installation already exists
    const { data: existingInstallation } = await supabase
      .from("ghl_installations")
      .select("*")
      .eq("location_id", locationId)
      .eq("company_id", companyId)
      .maybeSingle();

    if (existingInstallation) {
      console.log("Installation already exists, refreshing the access token...");
      
      // Generate a fake token
      const accessToken = `token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const refreshToken = `refresh-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      
      // Set expiration date to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Update the existing installation
      const { data, error } = await supabase
        .from("ghl_installations")
        .update({
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", existingInstallation.id)
        .select();
      
      if (error) {
        console.error("Error updating installation:", error);
        throw error;
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: "Installation updated successfully",
        installation: data
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    
    console.log("Creating new installation...");
    
    // Generate a fake token
    const accessToken = `token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const refreshToken = `refresh-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    // Set expiration date to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create a new installation record
    const { data, error } = await supabase
      .from("ghl_installations")
      .insert({
        location_id: locationId,
        company_id: companyId,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error("Error creating installation:", error);
      throw error;
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: "Installation created successfully",
      installation: data
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in force-connect-ghl:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
}); 