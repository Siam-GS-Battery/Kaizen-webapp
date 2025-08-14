-- Migration: Add commander and subordinate columns to users table
-- Date: 2025-08-14

-- Add commander and subordinate columns to users table
ALTER TABLE users 
ADD COLUMN commander VARCHAR(20),
ADD COLUMN subordinate VARCHAR(20);

-- Add foreign key constraints
ALTER TABLE users 
ADD CONSTRAINT fk_commander 
  FOREIGN KEY (commander) REFERENCES users(employee_id) ON DELETE SET NULL;

ALTER TABLE users 
ADD CONSTRAINT fk_subordinate 
  FOREIGN KEY (subordinate) REFERENCES users(employee_id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX idx_users_commander ON users(commander);
CREATE INDEX idx_users_subordinate ON users(subordinate);

-- Add comments for the new columns
COMMENT ON COLUMN users.commander IS 'Employee ID of the commander (supervisor/manager)';
COMMENT ON COLUMN users.subordinate IS 'Employee ID of the subordinate';

-- Sample data update (optional - can be customized based on your org structure)
-- Example: Set some commanders for existing users
-- UPDATE users SET commander = '261401' WHERE employee_id IN ('241303', '241304'); -- Montree as commander
-- UPDATE users SET commander = '251307' WHERE employee_id = '241303'; -- Phantira as commander for Rachanok

-- Grant appropriate permissions
GRANT ALL ON users TO authenticated;