-- Migration to add BEST_KAIZEN status to project_status enum
-- This migration should be run on the production database

-- First, add the new value to the enum
ALTER TYPE project_status ADD VALUE 'BEST_KAIZEN';

-- Update any projects that should be marked as BEST_KAIZEN
-- (This is just an example - adjust criteria as needed)
-- UPDATE projects SET status = 'BEST_KAIZEN' WHERE status = 'APPROVED' AND id IN (
--   -- Add specific project IDs or criteria here
-- );

-- Comments for reference
COMMENT ON TYPE project_status IS 'Project status including BEST_KAIZEN for exceptional projects';