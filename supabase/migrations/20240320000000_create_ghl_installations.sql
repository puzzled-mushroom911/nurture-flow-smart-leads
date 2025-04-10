-- Create the ghl_installations table
CREATE TABLE IF NOT EXISTS ghl_installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id TEXT NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on location_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ghl_installations_location_id ON ghl_installations(location_id);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ghl_installations_updated_at
    BEFORE UPDATE ON ghl_installations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 