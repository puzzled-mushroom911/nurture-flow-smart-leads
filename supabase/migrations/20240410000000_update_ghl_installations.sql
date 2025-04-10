-- Update ghl_installations table schema
ALTER TABLE ghl_installations
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS company_id TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS ghl_installations_user_id_idx ON ghl_installations(user_id);
CREATE INDEX IF NOT EXISTS ghl_installations_state_idx ON ghl_installations(state); 