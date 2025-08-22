-- Migration: Add position column to users table
-- Date: 2025-08-14

-- Add position column to users table
ALTER TABLE users 
ADD COLUMN position VARCHAR(50) DEFAULT 'พนักงาน' CHECK (position IN ('พนักงาน', 'เจ้าหน้าที่', 'วิศวกร', 'วิศวกรอาวุโส'));

-- Update existing users with default position based on role
UPDATE users 
SET position = CASE 
    WHEN role = 'Manager' THEN 'วิศวกรอาวุโส'
    WHEN role = 'Supervisor' THEN 'วิศวกร'
    WHEN role = 'Admin' THEN 'วิศวกรอาวุโส'
    ELSE 'พนักงาน'
END;

-- Add index for better query performance
CREATE INDEX idx_users_position ON users(position);

-- Add comment for the new column
COMMENT ON COLUMN users.position IS 'Employee position: พนักงาน, เจ้าหน้าที่, วิศวกร, วิศวกรอาวุโส';

-- Update the projects table position column to use constraint
ALTER TABLE projects 
DROP COLUMN position;

ALTER TABLE projects 
ADD COLUMN position VARCHAR(50) CHECK (position IN ('พนักงาน', 'เจ้าหน้าที่', 'วิศวกร', 'วิศวกรอาวุโส'));