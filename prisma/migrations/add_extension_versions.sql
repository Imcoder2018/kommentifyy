-- Create extension_versions table for Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS extension_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    features TEXT[] DEFAULT '{}',
    bug_fixes TEXT[] DEFAULT '{}',
    download_url TEXT,
    release_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster version lookups
CREATE INDEX IF NOT EXISTS idx_extension_versions_version ON extension_versions(version);
CREATE INDEX IF NOT EXISTS idx_extension_versions_created_at ON extension_versions(created_at DESC);

-- Insert initial version (update with your actual current version details)
INSERT INTO extension_versions (version, features, bug_fixes, download_url, release_notes)
VALUES (
    '1.3.4',
    ARRAY['AI-powered comment generation', 'Scheduled post automation', 'Network growth tools', 'Business hours scheduling'],
    ARRAY['Fixed scheduled posts reliability', 'Improved tab switching for posting'],
    '',
    'Current stable release with all core features'
) ON CONFLICT (version) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_extension_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS extension_versions_updated_at ON extension_versions;
CREATE TRIGGER extension_versions_updated_at
    BEFORE UPDATE ON extension_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_extension_versions_updated_at();
