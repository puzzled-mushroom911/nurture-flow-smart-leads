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

// Define a proper type for our results
interface SchemaUpdateResults {
  actions: string[];
  success: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting schema update function");
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const results: SchemaUpdateResults = {
      actions: [],
      success: false
    };
    
    // First, check if the table exists
    console.log("Checking if ghl_installations table exists");
    const { data: tables, error: tablesError } = await supabase
      .from("pg_catalog.pg_tables")
      .select("tablename")
      .eq("schemaname", "public")
      .eq("tablename", "ghl_installations");
    
    if (tablesError) {
      console.error("Error checking tables:", tablesError);
      throw new Error(`Failed to check tables: ${tablesError.message}`);
    }
    
    // If the table doesn't exist, create it
    if (!tables || tables.length === 0) {
      console.log("Table ghl_installations doesn't exist, creating it");
      results.actions.push("Creating ghl_installations table");
      
      // Execute SQL to create the table with all needed columns
      const { error: createError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS ghl_installations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            location_id TEXT NOT NULL,
            company_id TEXT NOT NULL,
            location_name TEXT,
            company_name TEXT,
            access_token TEXT NOT NULL,
            refresh_token TEXT NOT NULL,
            token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            scope TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(location_id, company_id)
          );
        `
      });
      
      if (createError) {
        console.error("Error creating table:", createError);
        throw new Error(`Failed to create table: ${createError.message}`);
      }
      
      results.actions.push("Table created successfully");
    } else {
      console.log("Table ghl_installations exists, checking columns");
      
      // Check if location_name column exists
      const { data: columns, error: columnsError } = await supabase.rpc("exec_sql", {
        sql: `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'ghl_installations'
            AND column_name = 'location_name';
        `
      });
      
      if (columnsError) {
        console.error("Error checking columns:", columnsError);
        throw new Error(`Failed to check columns: ${columnsError.message}`);
      }
      
      // If location_name column doesn't exist, add it
      if (!columns || columns.length === 0) {
        console.log("Column location_name doesn't exist, adding it");
        results.actions.push("Adding location_name column");
        
        const { error: addColumnError } = await supabase.rpc("exec_sql", {
          sql: `
            ALTER TABLE ghl_installations
            ADD COLUMN IF NOT EXISTS location_name TEXT;
          `
        });
        
        if (addColumnError) {
          console.error("Error adding location_name column:", addColumnError);
          throw new Error(`Failed to add location_name column: ${addColumnError.message}`);
        }
        
        results.actions.push("Added location_name column");
      }
      
      // Check if company_name column exists
      const { data: companyColumns, error: companyColumnsError } = await supabase.rpc("exec_sql", {
        sql: `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'ghl_installations'
            AND column_name = 'company_name';
        `
      });
      
      if (companyColumnsError) {
        console.error("Error checking company_name column:", companyColumnsError);
        throw new Error(`Failed to check company_name column: ${companyColumnsError.message}`);
      }
      
      // If company_name column doesn't exist, add it
      if (!companyColumns || companyColumns.length === 0) {
        console.log("Column company_name doesn't exist, adding it");
        results.actions.push("Adding company_name column");
        
        const { error: addColumnError } = await supabase.rpc("exec_sql", {
          sql: `
            ALTER TABLE ghl_installations
            ADD COLUMN IF NOT EXISTS company_name TEXT;
          `
        });
        
        if (addColumnError) {
          console.error("Error adding company_name column:", addColumnError);
          throw new Error(`Failed to add company_name column: ${addColumnError.message}`);
        }
        
        results.actions.push("Added company_name column");
      }
    }
    
    // Add an RPC function to execute SQL (if not exists)
    console.log("Ensuring exec_sql function exists");
    const { error: rpcError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result JSONB;
        BEGIN
          EXECUTE sql;
          result := '[]'::JSONB;
          RETURN result;
        EXCEPTION WHEN OTHERS THEN
          result := jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE);
          RETURN result;
        END;
        $$;
      `
    });
    
    if (rpcError && rpcError.message && !rpcError.message.includes("function already exists")) {
      console.error("Error creating exec_sql function:", rpcError);
      results.actions.push(`Failed to create exec_sql function: ${rpcError.message}`);
    } else {
      results.actions.push("exec_sql function ensured");
    }
    
    // Update was successful
    results.success = true;
    
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
    console.error("Error updating schema:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
}); 