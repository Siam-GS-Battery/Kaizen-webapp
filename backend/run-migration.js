const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running migration to add standard_certification column...');
    
    // First, check if column already exists
    const { data: columns, error: checkError } = await supabase
      .rpc('get_table_columns', { 
        table_name: 'projects' 
      })
      .catch(() => ({ data: null, error: null }));
    
    // If we can't check columns, just try to add the column
    // Add the column using raw SQL through rpc
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE projects 
        ADD COLUMN IF NOT EXISTS standard_certification TEXT DEFAULT '-';
      `
    }).catch(async () => {
      // If exec_sql doesn't exist, try updating a row to force column creation
      console.log('Attempting alternative approach...');
      
      // Get a sample project
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .limit(1);
      
      if (projects && projects.length > 0) {
        // Try to update with the new column
        const { error: updateError } = await supabase
          .from('projects')
          .update({ standard_certification: '-' })
          .eq('id', projects[0].id);
        
        if (updateError && updateError.message.includes('column')) {
          console.log('Column does not exist. Manual database update required.');
          console.log('\nPlease run the following SQL in your Supabase SQL editor:');
          console.log('----------------------------------------');
          console.log("ALTER TABLE projects ADD COLUMN IF NOT EXISTS standard_certification TEXT DEFAULT '-';");
          console.log("UPDATE projects SET standard_certification = '-' WHERE standard_certification IS NULL;");
          console.log('----------------------------------------');
          return { error: 'Manual update required' };
        }
      }
      
      return { error: null };
    });
    
    if (error) {
      console.log('\nNote: The column might need to be added manually.');
      console.log('Please go to your Supabase dashboard -> SQL Editor and run:');
      console.log('----------------------------------------');
      console.log("ALTER TABLE projects ADD COLUMN IF NOT EXISTS standard_certification TEXT DEFAULT '-';");
      console.log("UPDATE projects SET standard_certification = '-' WHERE standard_certification IS NULL;");
      console.log('----------------------------------------');
    } else {
      console.log('Migration completed successfully!');
      
      // Update existing records
      const { error: updateError } = await supabase
        .from('projects')
        .update({ standard_certification: '-' })
        .is('standard_certification', null);
      
      if (!updateError) {
        console.log('Updated existing records with default value.');
      }
    }
    
  } catch (error) {
    console.error('Migration error:', error);
    console.log('\nPlease add the column manually in Supabase:');
    console.log('----------------------------------------');
    console.log("ALTER TABLE projects ADD COLUMN IF NOT EXISTS standard_certification TEXT DEFAULT '-';");
    console.log("UPDATE projects SET standard_certification = '-' WHERE standard_certification IS NULL;");
    console.log('----------------------------------------');
  }
}

runMigration();