-- Enable extensions (after enabling vector in dashboard)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create enum types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE document_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE metric_type AS ENUM ('api_calls', 'documents_processed', 'embeddings_generated'); 