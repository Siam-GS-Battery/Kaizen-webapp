# คู่มือการเชื่อมต่อ Storage กับ Supabase

## ภาพรวมของระบบ

ระบบ Kaizen ใช้ Supabase Storage สำหรับจัดเก็บรูปภาพโครงการ โดยมีการจัดการผ่าน `StorageService` class ที่ทำงานแบบ Singleton pattern

## ไฟล์ที่เกี่ยวข้อง

- **StorageService**: `/backend/src/services/storageService.ts`
- **Database Config**: `/backend/src/config/database.ts`

## ขั้นตอนการตั้งค่า

### 1. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` และเพิ่มข้อมูลดังนี้:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key (optional)
```

### 2. การติดตั้ง Dependencies

```bash
npm install @supabase/supabase-js uuid
npm install --save-dev @types/uuid
```

### 3. การกำหนดค่า Database Config

ไฟล์ `/backend/src/config/database.ts` ทำหน้าที่:

```typescript
// สร้าง Supabase clients
export const supabase = createClient(url, anon_key)
export const supabaseAdmin = createClient(url, service_key) // สำหรับ admin operations

// กำหนดชื่อ Storage Bucket
export const STORAGE_BUCKETS = {
  PROJECT_IMAGES: 'project-images'
}

// Helper functions สำหรับ Storage operations
export const getPublicImageUrl = (bucket, filePath) => {...}
export const uploadImage = (bucket, filePath, file, options) => {...}
export const deleteImage = (bucket, filePaths) => {...}
```

## วิธีการใช้งาน StorageService

### 1. เริ่มต้น StorageService

```typescript
import StorageService from '../services/storageService';

const storageService = StorageService.getInstance();
```

### 2. สร้าง Storage Bucket (ครั้งแรก)

```typescript
// จะสร้าง bucket อัตโนมัติถ้าไม่มี
await storageService.initializeBucket('project-images');
```

### 3. การอัปโหลดรูปภาพโครงการ

```typescript
// อัปโหลดรูปภาพเดี่ยว
const uploadResult = await storageService.uploadProjectImage(
  file,           // Express.Multer.File
  projectId,      // string
  'before',       // 'before' | 'after'
  employeeId      // string
);

// อัปโหลดหลายรูปภาพ
const uploadResults = await storageService.uploadMultipleProjectImages(
  files,          // Express.Multer.File[]
  projectId,      // string
  employeeId      // string
);
```

### 4. การดึงรูปภาพโครงการ

```typescript
const images = await storageService.getProjectImages(projectId);
// Returns: { before?: string, after?: string }
```

### 5. การลบรูปภาพ

```typescript
// ลบรูปภาพเดี่ยว
await storageService.deleteProjectImage(filePath);

// ลบหลายรูปภาพ
await storageService.deleteProjectImages([filePath1, filePath2]);
```

### 6. การทำความสะอาดรูปภาพที่ไม่ใช้

```typescript
// ลบรูปภาพที่ไม่มี reference ในฐานข้อมูล
await storageService.cleanupOrphanedImages();
```

### 7. การตรวจสอบข้อมูล Storage

```typescript
const stats = await storageService.getStorageStats();
// Returns: { totalFiles: number, totalSize: number, bucketSize: number }
```

## โครงสร้างการเก็บไฟล์

```
project-images/
├── projects/
    ├── {projectId}/
        ├── before_{projectId}_{uuid}.jpg
        ├── after_{projectId}_{uuid}.jpg
        └── ...
```

## คุณสมบัติหลัก

### 1. **Singleton Pattern**
- รับประกันว่ามีเพียง instance เดียวของ StorageService

### 2. **Auto Bucket Creation**
- สร้าง bucket อัตโนมัติพร้อม configurations:
  - Public access
  - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
  - File size limit: 5MB

### 3. **File Naming Convention**
- รูปภาพ before: `before_{projectId}_{uuid}.{extension}`
- รูปภาพ after: `after_{projectId}_{uuid}.{extension}`

### 4. **Error Handling**
- มี try-catch สำหรับทุก operations
- Log errors อย่างละเอียด
- คืนค่า fallback เมื่อเกิด error

### 5. **Storage Management**
- ระบบทำความสะอาดรูปภาพที่ไม่ใช้
- การตรวจสอบ usage statistics
- การจัดการ RLS policies

## การแก้ปัญหาที่พบบ่อย

### 1. RLS Policy Error
หากพบ error เกี่ยวกับ RLS policy ให้รัน SQL นี้ใน Supabase Dashboard:

```sql
CREATE POLICY "Allow service role to manage buckets" 
ON storage.buckets FOR ALL 
USING (auth.role() = 'service_role');
```

### 2. Upload Permission Error
ตรวจสอบ Storage policies ใน Supabase Dashboard:

```sql
-- Policy สำหรับ Upload
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'project-images');

-- Policy สำหรับ Public Access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'project-images');
```

### 3. Environment Variables
ตรวจสอบให้แน่ใจว่า environment variables ถูกต้อง:
- `SUPABASE_URL`: URL ของ Supabase project
- `SUPABASE_ANON_KEY`: Public anon key
- `SUPABASE_SERVICE_KEY`: Service role key (สำหรับ admin operations)

## การทดสอบการเชื่อมต่อ

```typescript
import { testDatabaseConnection } from '../config/database';

// ทดสอบการเชื่อมต่อฐานข้อมูล
const isConnected = await testDatabaseConnection();
console.log('Database connected:', isConnected);

// ทดสอบการสร้าง bucket
await storageService.initializeBucket();
```

## Best Practices

1. **ใช้ Service Role Key** สำหรับ admin operations เท่านั้น
2. **ตรวจสอบ File Size** ก่อน upload (max 5MB)
3. **ใช้ UUID** สำหรับป้องกันชื่อไฟล์ซ้ำ
4. **ทำ Cleanup** รูปภาพที่ไม่ใช้เป็นประจำ
5. **Monitor Storage Usage** เพื่อจัดการ quota

## Security Considerations

- Public bucket สำหรับรูปภาพที่แชร์ได้
- RLS policies สำหรับควบคุมการเข้าถึง
- File type validation ป้องกันไฟล์ที่ไม่ต้องการ
- Size limits ป้องกัน storage abuse