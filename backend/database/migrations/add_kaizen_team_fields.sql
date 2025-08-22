-- Migration: Add Kaizen Team fields to users table
-- Description: Add is_kaizen_team flag and assignment date for dual-layer role system

-- Add columns for Kaizen team management
ALTER TABLE users 
ADD COLUMN is_kaizen_team BOOLEAN DEFAULT FALSE,
ADD COLUMN kaizen_team_assigned_date TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on Kaizen team members
CREATE INDEX idx_users_is_kaizen_team ON users(is_kaizen_team) WHERE is_kaizen_team = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN users.is_kaizen_team IS 'Flag to indicate if user is part of Kaizen team (for admin page access)';
COMMENT ON COLUMN users.kaizen_team_assigned_date IS 'Date when user was assigned to Kaizen team';

-- Update the updated_at column for tracking
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists for users table (in case it doesn't exist)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();