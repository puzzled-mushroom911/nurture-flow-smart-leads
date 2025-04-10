-- Drop existing table if it exists
DROP TABLE IF EXISTS ghl_installations;

-- Create new table with correct schema
CREATE TABLE ghl_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  location_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  state TEXT,
  company_id TEXT
);

-- Add RLS policies
ALTER TABLE ghl_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own installations"
ON ghl_installations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own installations"
ON ghl_installations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installations"
ON ghl_installations
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX ghl_installations_user_id_idx ON ghl_installations(user_id);
CREATE INDEX ghl_installations_state_idx ON ghl_installations(state);
CREATE INDEX ghl_installations_location_id_idx ON ghl_installations(location_id); 