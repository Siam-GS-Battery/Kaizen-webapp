-- Migration: Fix image column size limits
-- This migration changes the before_project_image and after_project_image columns
-- from VARCHAR(255) to TEXT to accommodate either longer URLs or base64 data

-- Change the column types from VARCHAR(255) to TEXT
ALTER TABLE projects 
ALTER COLUMN before_project_image TYPE TEXT;

ALTER TABLE projects 
ALTER COLUMN after_project_image TYPE TEXT;

-- Add comments to clarify the new usage
COMMENT ON COLUMN projects.before_project_image IS 'URL or path to before project image stored in project-images storage';
COMMENT ON COLUMN projects.after_project_image IS 'URL or path to after project image stored in project-images storage';