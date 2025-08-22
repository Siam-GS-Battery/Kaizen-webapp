const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStorage() {
  console.log('Testing Supabase Storage...\n');

  try {
    // 1. List buckets
    console.log('1. Listing all storage buckets:');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    console.log('Available buckets:', buckets.map(b => b.name));
    
    // 2. Check if project-images bucket exists
    const projectImagesBucket = buckets.find(b => b.name === 'project-images');
    
    if (!projectImagesBucket) {
      console.log('\n2. Creating project-images bucket...');
      const { data, error } = await supabase.storage.createBucket('project-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Bucket created successfully:', data);
      }
    } else {
      console.log('\n2. project-images bucket already exists');
      console.log('Bucket details:', projectImagesBucket);
    }

    // 3. Test upload with a small test image
    console.log('\n3. Testing image upload...');
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const base64Data = testImageBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const fileName = `test-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
    } else {
      console.log('Upload successful:', uploadData);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);
      
      console.log('Public URL:', urlData.publicUrl);
      
      // Clean up - delete test file
      console.log('\n4. Cleaning up test file...');
      const { error: deleteError } = await supabase.storage
        .from('project-images')
        .remove([fileName]);
      
      if (deleteError) {
        console.error('Delete error:', deleteError);
      } else {
        console.log('Test file deleted successfully');
      }
    }

    console.log('\n✅ Storage test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStorage();