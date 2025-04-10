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

-- Add type for ghl_installations
CREATE TYPE ghl_installation_type AS (
  id UUID,
  user_id UUID,
  location_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  state TEXT,
  company_id TEXT
);

-- Add function to get ghl_installation by id
CREATE OR REPLACE FUNCTION get_ghl_installation_by_id(installation_id UUID)
RETURNS ghl_installation_type
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT *
    FROM ghl_installations
    WHERE id = installation_id
  );
END;
$$;

-- Add function to get ghl_installation by state
CREATE OR REPLACE FUNCTION get_ghl_installation_by_state(installation_state TEXT)
RETURNS ghl_installation_type
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT *
    FROM ghl_installations
    WHERE state = installation_state
  );
END;
$$;

-- Add function to get ghl_installation by user_id
CREATE OR REPLACE FUNCTION get_ghl_installation_by_user_id(user_id UUID)
RETURNS ghl_installation_type
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT *
    FROM ghl_installations
    WHERE user_id = user_id
  );
END;
$$; 