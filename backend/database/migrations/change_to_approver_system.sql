-- Migration: Change from Commander/Subordinate to Approver system
-- Date: 2025-08-14

-- 1. Add approver column to users table
ALTER TABLE users 
ADD COLUMN approver VARCHAR(20);

-- 2. Add foreign key constraint for approver
ALTER TABLE users 
ADD CONSTRAINT fk_approver 
  FOREIGN KEY (approver) REFERENCES users(employee_id) ON DELETE SET NULL;

-- 3. Add index for better query performance
CREATE INDEX idx_users_approver ON users(approver);

-- 4. Migrate existing data from commander to approver
-- Logic: If someone has a commander, that commander becomes their approver
UPDATE users 
SET approver = commander 
WHERE commander IS NOT NULL;

-- 5. Drop the old commander and subordinate columns
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_commander;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_subordinate;
DROP INDEX IF EXISTS idx_users_commander;
DROP INDEX IF EXISTS idx_users_subordinate;
ALTER TABLE users DROP COLUMN IF EXISTS commander;
ALTER TABLE users DROP COLUMN IF EXISTS subordinate;

-- 6. Add comment for the new column
COMMENT ON COLUMN users.approver IS 'Employee ID of the approver (person who approves this user tasks)';

-- 7. Sample data updates for better hierarchy structure
-- Set specific approvers based on role hierarchy
-- Managers approve Supervisors, Supervisors approve Users
UPDATE users 
SET approver = (
    SELECT u2.employee_id 
    FROM users u2 
    WHERE u2.role = 'Manager' 
    AND u2.department = users.department 
    LIMIT 1
) 
WHERE role = 'Supervisor' AND approver IS NULL;

UPDATE users 
SET approver = (
    SELECT u2.employee_id 
    FROM users u2 
    WHERE u2.role = 'Supervisor' 
    AND u2.department = users.department 
    LIMIT 1
) 
WHERE role = 'User' AND approver IS NULL;

-- Grant appropriate permissions
GRANT ALL ON users TO authenticated;