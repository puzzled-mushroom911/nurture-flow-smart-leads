import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = "https://vxgvmmudspqwsaedcmsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Z3ZtbXVkc3Bxd3NhZWRjbXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODk4MzgsImV4cCI6MjA1OTU2NTgzOH0.wSYR4wG-jL2ZjYsluabFRGQKqtajPFhWrqE8QAd0YXw";
const GHL_CLIENT_ID = Deno.env.get("GHL_CLIENT_ID") || "67f3402bb0c46a1b8d090311-m96hrsry";
const GHL_CLIENT_SECRET = Deno.env.get("GHL_CLIENT_SECRET") || "f232bf2c-a0e9-4af4-8f63-0cbc7a074db1";

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
    console.log("Starting import-contacts function");

    // Get request data
    let body;
    let forceMode = false;
    try {
      const url = new URL(req.url);
      forceMode = url.searchParams.get("force") === "true";
      body = await req.json();
    } catch (e) {
      console.log("Could not parse request body, using default values");
      body = { action: "import" };
    }
    
    const { action } = body;
    
    if (action !== "import") {
      throw new Error("Invalid action");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get the latest installation or check if we need to create a temporary one
    console.log("Checking GHL installation...");
    const { data: installation, error: installationError } = await supabase
      .from("ghl_installations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    // Handle installation fetch errors
    if (installationError && installationError.code !== 'PGRST116') {
      console.error("Error getting installation:", installationError);
      
      if (!forceMode) {
        throw new Error(`Failed to get GHL installation: ${installationError.message}`);
      }
    }
    
    // If no installation found and force mode is enabled, create a temporary one
    let activeInstallation = installation;
    
    if ((!installation || installationError) && forceMode) {
      console.log("No installation found. Force mode enabled - creating temporary installation");
      
      // Create a temporary installation for testing
      const locationId = "dummy-loc-" + Date.now().toString().substring(8);
      const companyId = "dummy-comp-" + Date.now().toString().substring(8);
      const accessToken = `dummy-token-${Date.now()}`;
      const refreshToken = `dummy-refresh-${Date.now()}`;
      
      // Set expiration date to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      try {
        // Create a new installation record
        const { data: tempInstall, error: createError } = await supabase
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
          
        if (createError) {
          console.error("Error creating temporary installation:", createError);
          throw new Error(`Failed to create temporary installation: ${createError.message}`);
        }
        
        activeInstallation = tempInstall?.[0];
        console.log("Temporary installation created:", activeInstallation?.id);
      } catch (tempInstallError) {
        console.error("Error creating temporary installation:", tempInstallError);
        throw new Error(`Failed to create temporary installation: ${tempInstallError.message}`);
      }
    }
    
    if (!activeInstallation) {
      console.error("No GHL installation found");
      throw new Error("You need to connect to GoHighLevel first or use the force parameter");
    }
    
    console.log("Using installation for location:", activeInstallation.location_id);
    
    // Generate test data - in force mode, we create dummy contacts
    let contacts = [];
    if (forceMode) {
      console.log("Force mode enabled - generating dummy contacts");
      contacts = generateDummyContacts(10);
    } else {
      // Fetch contacts from GHL API
      console.log("Fetching contacts from GHL API");
      contacts = await fetchContacts(activeInstallation.access_token, activeInstallation.location_id);
    }
    
    console.log(`Processing ${contacts.length} contacts`);
    
    // Process each contact
    let importedCount = 0;
    let errorCount = 0;
    for (const contact of contacts) {
      try {
        // Prepare contact data
        const contactData = {
          installation_id: activeInstallation.id,
          ghl_contact_id: contact.id || `dummy-${Date.now()}-${importedCount}`,
          name: forceMode ? contact.name : 
            `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
          email: forceMode ? contact.email : (contact.email || ''),
          phone: forceMode ? contact.phone : (contact.phone || ''),
          status: 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Insert the contact data
        const { error: insertError } = await supabase
          .from("leads")
          .upsert(contactData, {
            onConflict: "ghl_contact_id,installation_id"
          });
        
        if (insertError) {
          console.error("Error importing contact:", insertError);
          errorCount++;
        } else {
          importedCount++;
        }
      } catch (contactError) {
        console.error("Error processing contact:", contactError);
        errorCount++;
      }
    }
    
    console.log(`Import complete: ${importedCount} imported, ${errorCount} errors`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully imported ${importedCount} contacts${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
      imported: importedCount,
      errors: errorCount,
      forceMode,
      installationId: activeInstallation.id,
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error importing contacts:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

async function fetchContacts(accessToken: string, locationId: string) {
  try {
    console.log(`Fetching contacts for location ${locationId}`);
    // Fetch contacts from GHL API (first page, limit 100)
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&limit=100`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Version": "2021-04-15",
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("GHL API error:", errorText);
      throw new Error(`Error fetching contacts: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.contacts || [];
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }
}

function generateDummyContacts(count = 10) {
  const contacts = [];
  const domains = ['example.com', 'test.com', 'dummy.org', 'fake.net'];
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Michael', 'Emma', 'David', 'Olivia'];
  const lastNames = ['Smith', 'Jones', 'Brown', 'Johnson', 'Wilson', 'Moore', 'Taylor', 'Miller'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    contacts.push({
      id: `dummy-${Date.now()}-${i}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  }
  
  return contacts;
} 