// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = "https://vxgvmmudspqwsaedcmsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z3ZtbXVkc3Bxd3NhZWRjbXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODk4MzgsImV4cCI6MjA1OTU2NTgzOH0.wSYR4wG-jL2ZjYsluabFRGQKqtajPFhWrqE8QAd0YXw";

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
    const mode = url.searchParams.get("mode") || "diagnose"; // diagnose, fix, create, recreate
    const results = {
      mode,
      diagnostics: {},
      actions: [],
      fixed: false,
    };

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // PHASE 1: Get Database Schema
    try {
      console.log("Checking database schema...");
      results.diagnostics.schema = {};
      
      // Check if ghl_installations table exists
      const { data: tables, error: tablesError } = await supabase
        .from("pg_catalog.pg_tables")
        .select("tablename")
        .eq("schemaname", "public");
      
      if (tablesError) {
        throw new Error(`Failed to get tables: ${tablesError.message}`);
      }
      
      results.diagnostics.schema.tables = tables?.map(t => t.tablename) || [];
      results.diagnostics.schema.hasGhlInstallationsTable = 
        tables?.some(t => t.tablename === "ghl_installations") || false;
      
      if (!results.diagnostics.schema.hasGhlInstallationsTable) {
        results.actions.push("Create ghl_installations table");
        
        if (mode === "fix" || mode === "recreate") {
          console.log("Creating ghl_installations table...");
          // Create the table
          const { error: createError } = await supabase.rpc("create_ghl_installations_table");
          if (createError) {
            throw new Error(`Failed to create table: ${createError.message}`);
          }
          results.actions.push("Created ghl_installations table");
        }
      }
      
      // Get ghl_installations table schema
      const { data: columns, error: columnsError } = await supabase
        .from("pg_catalog.pg_attribute")
        .select("attname")
        .eq("attrelid", "ghl_installations::regclass")
        .gt("attnum", 0);
      
      if (!columnsError) {
        results.diagnostics.schema.ghlInstallationsColumns = columns?.map(c => c.attname) || [];
      } else {
        results.diagnostics.schema.ghlInstallationsColumns = [];
        console.log("Error fetching columns:", columnsError);
      }
      
    } catch (schemaError) {
      console.error("Schema analysis error:", schemaError);
      results.diagnostics.schema.error = schemaError.message;
    }
    
    // PHASE 2: Check GHL Installations
    try {
      console.log("Checking ghl_installations...");
      results.diagnostics.installations = {};
      
      // Check installations table content
      const { data: installations, error: installationsError } = await supabase
        .from("ghl_installations")
        .select("*");
      
      if (installationsError) {
        throw new Error(`Failed to get installations: ${installationsError.message}`);
      }
      
      results.diagnostics.installations.count = installations?.length || 0;
      results.diagnostics.installations.list = installations?.map(i => ({
        id: i.id,
        location_id: i.location_id,
        company_id: i.company_id,
        created_at: i.created_at,
        token_expires_at: i.token_expires_at,
      })) || [];
      
      // Check if we need to create an installation
      if (installations?.length === 0 && (mode === "fix" || mode === "create" || mode === "recreate")) {
        console.log("Creating test installation...");
        results.actions.push("Create test installation");
        
        // Generate test data
        const locationId = "test-loc-" + Date.now().toString().substring(8);
        const companyId = "test-comp-" + Date.now().toString().substring(8);
        const accessToken = `token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const refreshToken = `refresh-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        
        // Set expiration date to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // Create a new installation record
        const { data: newInstall, error: createError } = await supabase
          .from("ghl_installations")
          .insert({
            location_id: locationId,
            company_id: companyId,
            location_name: "Test Location",
            company_name: "Test Company",
            access_token: accessToken,
            refresh_token: refreshToken,
            token_expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (createError) {
          throw new Error(`Failed to create installation: ${createError.message}`);
        }
        
        results.diagnostics.installations.created = newInstall?.[0] || null;
        results.actions.push("Created test installation");
        results.fixed = true;
      }
      
      // If we have installations but mode is recreate, delete and recreate
      if (installations?.length > 0 && mode === "recreate") {
        console.log("Recreating installation...");
        results.actions.push("Delete existing installations");
        
        // Delete all installations
        const { error: deleteError } = await supabase
          .from("ghl_installations")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000"); // Safety to prevent deleting everything if no real ID
        
        if (deleteError) {
          throw new Error(`Failed to delete installations: ${deleteError.message}`);
        }
        
        results.actions.push("Deleted existing installations");
        
        // Create new test installation
        console.log("Creating new test installation...");
        
        // Generate test data
        const locationId = "test-loc-" + Date.now().toString().substring(8);
        const companyId = "test-comp-" + Date.now().toString().substring(8);
        const accessToken = `token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const refreshToken = `refresh-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        
        // Set expiration date to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // Create a new installation record
        const { data: newInstall, error: createError } = await supabase
          .from("ghl_installations")
          .insert({
            location_id: locationId,
            company_id: companyId,
            location_name: "Test Location",
            company_name: "Test Company",
            access_token: accessToken,
            refresh_token: refreshToken,
            token_expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (createError) {
          throw new Error(`Failed to create installation: ${createError.message}`);
        }
        
        results.diagnostics.installations.recreated = newInstall?.[0] || null;
        results.actions.push("Created new test installation");
        results.fixed = true;
      }
    } catch (installationsError) {
      console.error("Installations analysis error:", installationsError);
      results.diagnostics.installations.error = installationsError.message;
    }
    
    // PHASE 3: Test API / Permissions
    try {
      console.log("Testing API access...");
      results.diagnostics.api = {};
      
      // Test selecting from the installations table
      const { data: readTest, error: readError } = await supabase
        .from("ghl_installations")
        .select("id")
        .limit(1);
      
      results.diagnostics.api.canRead = !readError;
      if (readError) {
        results.diagnostics.api.readError = readError.message;
      }
      
      // Test inserting a temporary record
      const { data: insertTest, error: insertError } = await supabase
        .from("ghl_installations")
        .insert({
          location_id: "test-api-" + Date.now(),
          company_id: "test-api-" + Date.now(),
          access_token: "test-token",
          refresh_token: "test-refresh",
          token_expires_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      results.diagnostics.api.canWrite = !insertError;
      if (insertError) {
        results.diagnostics.api.writeError = insertError.message;
      } else {
        // If inserted successfully, delete the test record
        if (insertTest && insertTest[0] && insertTest[0].id) {
          const { error: deleteError } = await supabase
            .from("ghl_installations")
            .delete()
            .eq("id", insertTest[0].id);
          
          results.diagnostics.api.canDelete = !deleteError;
          if (deleteError) {
            results.diagnostics.api.deleteError = deleteError.message;
          }
        }
      }
    } catch (apiError) {
      console.error("API test error:", apiError);
      results.diagnostics.api.error = apiError.message;
    }
    
    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in GHL diagnostics:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
}); 