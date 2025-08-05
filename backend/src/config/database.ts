import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Public client for general operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Service client for admin operations (if service role key is provided)
export const supabaseAdmin = process.env.SUPABASE_SERVICE_KEY
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          persistSession: false,
        },
      }
    )
  : null;

// Database table names
export const TABLES = {
  USERS: 'users',
  SESSIONS: 'sessions', 
  PROJECTS: 'projects',
  PROJECT_IMAGES: 'project_images',
  PROJECT_STATUS_TRANSITIONS: 'project_status_transitions',
  PROJECT_HISTORY: 'project_history',
  DEPARTMENTS: 'departments',
  FIVE_S_GROUPS: 'five_s_groups',
  PROJECT_AREAS: 'project_areas',
  ADMIN_USERS: 'admin_users',
} as const;

// Supabase Storage bucket names
export const STORAGE_BUCKETS = {
  PROJECT_IMAGES: 'project-images'
} as const;

// Storage helper functions
export const getPublicImageUrl = (bucket: string, filePath: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

export const uploadImage = async (
  bucket: string, 
  filePath: string, 
  file: File | Buffer, 
  options?: { contentType?: string; upsert?: boolean }
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: options?.contentType,
      upsert: options?.upsert || false
    });
  
  if (error) throw error;
  return data;
};

export const deleteImage = async (bucket: string, filePaths: string[]) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(filePaths);
  
  if (error) throw error;
  return data;
};

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from(TABLES.USERS).select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Database connection test failed:', error.message);
      return false;
    }
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}