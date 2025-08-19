-- Add standard_certification column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS standard_certification TEXT DEFAULT '-';

-- Update existing records to have '-' as default value
UPDATE projects 
SET standard_certification = '-' 
WHERE standard_certification IS NULL;