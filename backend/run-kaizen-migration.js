const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runKaizenMigration() {
  try {
    console.log('🔄 Running Kaizen team migration...');
    
    // Check if the columns already exist by attempting a query
    const { data, error: checkError } = await supabase
      .from('users')
      .select('is_kaizen_team, kaizen_team_assigned_date')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Kaizen team columns already exist!');
      return;
    }
    
    console.log('📝 Adding Kaizen team columns...');
    console.log('Please run the following SQL manually in your Supabase SQL Editor:');
    console.log('----------------------------------------');
    console.log(`
-- Add Kaizen team fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_kaizen_team BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kaizen_team_assigned_date TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_is_kaizen_team ON users(is_kaizen_team) WHERE is_kaizen_team = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN users.is_kaizen_team IS 'Flag to indicate if user is part of Kaizen team (for admin page access)';
COMMENT ON COLUMN users.kaizen_team_assigned_date IS 'Date when user was assigned to Kaizen team';

-- Ensure trigger exists for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('----------------------------------------');
    
    // Try alternative approach if exec_sql exists
    try {
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        query: `
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS is_kaizen_team BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS kaizen_team_assigned_date TIMESTAMP WITH TIME ZONE;
          
          CREATE INDEX IF NOT EXISTS idx_users_is_kaizen_team ON users(is_kaizen_team) WHERE is_kaizen_team = TRUE;
        `
      });
      
      if (!sqlError) {
        console.log('✅ Migration completed successfully!');
        
        // Test the new columns
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('employee_id, is_kaizen_team, kaizen_team_assigned_date')
          .limit(1);
        
        if (!testError) {
          console.log('✅ New columns are working correctly!');
        }
      } else {
        console.log('⚠️  Manual SQL execution required.');
      }
    } catch (execError) {
      console.log('⚠️  Please execute the SQL manually in Supabase dashboard.');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    console.log('\n⚠️  Please add the columns manually in Supabase SQL Editor.');
  }
}

runKaizenMigration();