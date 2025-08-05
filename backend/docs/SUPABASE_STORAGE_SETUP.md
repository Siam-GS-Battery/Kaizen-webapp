# Supabase Storage Setup Guide

## 📋 Overview

คู่มือการติดตั้งและใช้งาน Supabase Storage สำหรับจัดเก็บรูปภาพโครงการ Kaizen (beforeProjectImage และ afterProjectImage)

## 🛠️ การติดตั้ง Supabase Storage

### Step 1: Setup Storage Bucket

1. เข้าสู่ Supabase Dashboard
2. ไปที่ Storage > Buckets
3. สร้าง bucket ใหม่หรือใช้ command line:

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true);
```

### Step 2: Configure Storage Policies

```sql
-- Allow authenticated users to upload images
INSERT INTO storage.policies (name, bucket_id, policy_type, policy_definition)
VALUES (
  'Allow authenticated users to upload project images',
  'project-images',
  'INSERT',
  'auth.role() = ''authenticated'''
);

-- Allow public read access to images
INSERT INTO storage.policies (name, bucket_id, policy_type, policy_definition)  
VALUES (
  'Allow public read access to project images',
  'project-images',
  'SELECT',
  'true'
);

-- Allow users to delete their own uploaded images
INSERT INTO storage.policies (name, bucket_id, policy_type, policy_definition)
VALUES (
  'Allow users to delete their own project images',
  'project-images',
  'DELETE',
  'auth.uid()::text = (storage.foldername(name))[1]'
);
```

### Step 3: Configure MIME Types และ File Size Limits

```sql
-- Update bucket configuration
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  file_size_limit = 5242880  -- 5MB
WHERE id = 'project-images';
```

## 📁 File Organization Structure

```
project-images/
├── projects/
│   ├── {project_id}/
│   │   ├── before_{project_id}_{uuid}.jpg
│   │   └── after_{project_id}_{uuid}.jpg
│   ├── {project_id_2}/
│   │   ├── before_{project_id_2}_{uuid}.jpg
│   │   └── after_{project_id_2}_{uuid}.jpg
│   └── ...
```

## 🔧 API Usage

### 1. Upload Single Image

```bash
curl -X POST http://localhost:3001/api/upload/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/image.jpg" \
  -F "projectId=123" \
  -F "imageType=before"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalName": "warehouse_before.jpg",
    "filename": "before_123_uuid-timestamp.jpg",
    "filePath": "projects/123/before_123_uuid-timestamp.jpg",
    "mimetype": "image/jpeg",
    "size": 1024000,
    "url": "https://your-project.supabase.co/storage/v1/object/public/project-images/projects/123/before_123_uuid-timestamp.jpg",
    "imageType": "before",
    "projectId": "123",
    "uploadedBy": "251307",
    "uploadedAt": "2025-01-05T10:30:00.000Z"
  },
  "message": "File uploaded successfully to Supabase Storage"
}
```

### 2. Upload Multiple Images

```bash
curl -X POST http://localhost:3001/api/upload/multiple \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@before_image.jpg" \
  -F "files=@after_image.jpg" \
  -F "projectId=123"
```

### 3. Get Project Images

```bash
curl -X GET http://localhost:3001/api/upload/project/123/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "before": "https://your-project.supabase.co/storage/v1/object/public/project-images/projects/123/before_123_uuid.jpg",
    "after": "https://your-project.supabase.co/storage/v1/object/public/project-images/projects/123/after_123_uuid.jpg"
  },
  "message": "Project images retrieved successfully"
}
```

### 4. Delete Project Image

```bash
curl -X DELETE http://localhost:3001/api/upload/project/123/image/before \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Storage Statistics (Admin only)

```bash
curl -X GET http://localhost:3001/api/upload/stats \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## 💡 Integration กับ Frontend

### React Component Example

```jsx
import React, { useState } from 'react';
import apiService from '../services/apiService';

const ImageUpload = ({ projectId, imageType, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('imageType', imageType);

      const response = await apiService.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setImageUrl(response.data.data.url);
        onUploadSuccess(response.data.data);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={`${imageType} image`}
          style={{ maxWidth: '300px', maxHeight: '200px' }}
        />
      )}
    </div>
  );
};

export default ImageUpload;
```

### Loading Project Images

```jsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const ProjectImages = ({ projectId }) => {
  const [images, setImages] = useState({ before: null, after: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await apiService.get(`/upload/project/${projectId}/images`);
        if (response.data.success) {
          setImages(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load images:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadImages();
    }
  }, [projectId]);

  if (loading) return <div>Loading images...</div>;

  return (
    <div className="project-images">
      <div className="before-after-container">
        <div className="image-section">
          <h3>Before</h3>
          {images.before ? (
            <img src={images.before} alt="Before" />
          ) : (
            <div className="no-image">No before image</div>
          )}
        </div>
        
        <div className="image-section">
          <h3>After</h3>
          {images.after ? (
            <img src={images.after} alt="After" />
          ) : (
            <div className="no-image">No after image</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectImages;
```

## 🔒 Security Considerations

### 1. File Validation
- เฉพาะไฟล์รูปภาพเท่านั้น (JPEG, PNG, GIF, WebP)
- จำกัดขนาดไฟล์ (5MB)
- ป้องกัน path traversal attacks

### 2. Authentication
- ต้อง login ก่อนอัพโหลด
- JWT token validation
- User ownership verification

### 3. Storage Policies
- RLS policies ใน Supabase
- Public read access สำหรับรูปภาพ
- Authenticated write access

## 🧹 Maintenance

### 1. Cleanup Orphaned Files

```bash
# API endpoint for cleanup (Admin only)
curl -X POST http://localhost:3001/api/upload/cleanup \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 2. Monitor Storage Usage

```javascript
// Check storage statistics
const getStorageStats = async () => {
  const response = await apiService.get('/upload/stats');
  console.log('Storage Stats:', response.data.data);
};
```

### 3. Regular Backup (Recommended)

```sql
-- Export all file metadata
SELECT 
  p.id,
  p.project_name,
  p.before_project_image,
  p.after_project_image,
  p.created_date
FROM projects p
WHERE p.before_project_image IS NOT NULL 
   OR p.after_project_image IS NOT NULL;
```

## 🐛 Troubleshooting

### Common Issues

1. **Upload Failed - Bucket Not Found**
   ```
   Error: Bucket not found
   Solution: Run bucket creation script in Supabase
   ```

2. **Permission Denied**
   ```
   Error: Permission denied
   Solution: Check RLS policies and JWT token
   ```

3. **File Too Large**
   ```
   Error: File too large
   Solution: Compress image or increase file size limit
   ```

4. **Invalid File Type**
   ```
   Error: Invalid file type
   Solution: Use only JPEG, PNG, GIF, or WebP files
   ```

### Debug Commands

```bash
# Test Supabase connection
curl -X GET http://localhost:3001/api/test-db

# Check storage bucket
curl -X GET http://localhost:3001/api/upload/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Verify JWT token
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Performance Tips

1. **Image Optimization**
   - Compress images before upload
   - Use appropriate image formats
   - Set reasonable dimensions

2. **Caching**
   - Images are publicly accessible
   - Browser caching enabled
   - CDN integration (optional)

3. **Batch Operations**
   - Use multiple upload for before/after pairs
   - Minimize API calls

---

**อัปเดตล่าสุด**: 2025-01-05  
**Version**: 1.0.0 with Supabase Storage Integration