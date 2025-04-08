import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Document {
  content: string
  metadata?: Record<string, any>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { document, installationId } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create OpenAI client
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Process document
    const chunks = await processDocument(document)
    const embeddings = await generateEmbeddings(chunks, openai)
    
    // Store document in knowledge base
    const { data: kb, error: kbError } = await supabaseClient
      .from('knowledge_base')
      .insert({
        installation_id: installationId,
        title: document.metadata?.title || 'Untitled Document',
        content: document.content,
        source: document.metadata?.source || 'manual_upload',
        file_url: document.metadata?.file_url,
        file_type: document.metadata?.file_type,
        status: 'completed'
      })
      .select()
      .single()

    if (kbError) throw kbError

    // Store embeddings
    const embeddingPromises = chunks.map((chunk, index) => {
      return supabaseClient
        .from('knowledge_base_embeddings')
        .insert({
          knowledge_base_id: kb.id,
          chunk_index: index,
          content: chunk.content,
          embedding: embeddings[index],
          metadata: chunk.metadata
        })
    })

    await Promise.all(embeddingPromises)

    // Update usage metrics
    await supabaseClient
      .from('usage_metrics')
      .insert({
        installation_id: installationId,
        metric_type: 'documents_processed',
        value: 1
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentId: kb.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function processDocument(document: Document) {
  // Split document into chunks
  const chunks: Document[] = []
  const content = document.content
  const chunkSize = 1000 // Adjust based on your needs
  
  for (let i = 0; i < content.length; i += chunkSize) {
    const chunk = content.slice(i, i + chunkSize)
    chunks.push({
      content: chunk,
      metadata: {
        ...document.metadata,
        start: i,
        end: i + chunk.length
      }
    })
  }
  
  return chunks
}

async function generateEmbeddings(chunks: Document[], openai: OpenAIApi) {
  const embeddings = []
  
  for (const chunk of chunks) {
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: chunk.content
    })
    
    embeddings.push(response.data.data[0].embedding)
  }
  
  return embeddings
} 