import { supabaseAdmin } from '../config/database';

async function checkDatabase() {
  console.log('🔍 Checking database state...');
  
  if (!supabaseAdmin) {
    console.error('❌ Admin client not available');
    return;
  }
  
  try {
    // Check if users table exists and has data
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('employee_id, first_name, last_name, department, role')
      .order('employee_id');
    
    if (usersError) {
      console.error('❌ Error querying users table:', usersError);
      return;
    }
    
    console.log(`✅ Found ${users?.length || 0} users in database:`);
    users?.forEach(user => {
      console.log(`  - ${user.employee_id}: ${user.first_name} ${user.last_name} (${user.department}, ${user.role})`);
    });
    
    // Check if projects table exists
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('id, project_name, employee_id')
      .limit(5);
    
    if (projectsError) {
      console.error('❌ Error querying projects table:', projectsError);
    } else {
      console.log(`✅ Found ${projects?.length || 0} projects in database (showing first 5)`);
    }
    
    // Check if sessions table exists
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('id, employee_id, is_active')
      .limit(5);
    
    if (sessionsError) {
      console.error('❌ Error querying sessions table:', sessionsError);
    } else {
      console.log(`✅ Found ${sessions?.length || 0} sessions in database`);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

if (require.main === module) {
  checkDatabase();
}

export { checkDatabase };