import { supabase, STORAGE_BUCKETS, getPublicImageUrl, uploadImage, deleteImage } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadResult {
  fileName: string;
  filePath: string;
  publicUrl: string;
  size?: number;
}

export class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Initialize storage bucket if it doesn't exist
  async initializeBucket(bucketName: string = STORAGE_BUCKETS.PROJECT_IMAGES): Promise<void> {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        });

        if (error) {
          console.error('Error creating bucket:', error);
          console.log(`⚠️ If you see RLS policy error, please run this SQL in Supabase Dashboard:`);
          console.log(`CREATE POLICY "Allow service role to manage buckets" ON storage.buckets FOR ALL USING (auth.role() = 'service_role');`);
        } else {
          console.log(`✅ Storage bucket '${bucketName}' created successfully`);
        }
      } else {
        console.log(`✅ Storage bucket '${bucketName}' already exists`);
      }
    } catch (error) {
      console.error('Error initializing bucket:', error);
    }
  }

  // Upload project image (before/after)
  async uploadProjectImage(
    file: Express.Multer.File,
    projectId: string,
    imageType: 'before' | 'after',
    employeeId: string
  ): Promise<UploadResult> {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${imageType}_${projectId}_${uuidv4()}${fileExtension}`;
      const filePath = `projects/${projectId}/${fileName}`;

      // Upload to Supabase Storage
      await uploadImage(
        STORAGE_BUCKETS.PROJECT_IMAGES,
        filePath,
        file.buffer,
        {
          contentType: file.mimetype,
          upsert: true
        }
      );

      // Get public URL
      const publicUrl = getPublicImageUrl(STORAGE_BUCKETS.PROJECT_IMAGES, filePath);

      return {
        fileName,
        filePath,
        publicUrl,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading project image:', error);
      throw new Error('Failed to upload image to storage');
    }
  }

  // Upload multiple project images
  async uploadMultipleProjectImages(
    files: Express.Multer.File[],
    projectId: string,
    employeeId: string
  ): Promise<UploadResult[]> {
    const uploadResults: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageType = i === 0 ? 'before' : 'after'; // First image is before, second is after
      
      try {
        const result = await this.uploadProjectImage(file, projectId, imageType, employeeId);
        uploadResults.push(result);
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        // Continue with other files even if one fails
      }
    }

    return uploadResults;
  }

  // Delete project image
  async deleteProjectImage(filePath: string): Promise<void> {
    try {
      await deleteImage(STORAGE_BUCKETS.PROJECT_IMAGES, [filePath]);
    } catch (error) {
      console.error('Error deleting project image:', error);
      throw new Error('Failed to delete image from storage');
    }
  }

  // Delete multiple project images
  async deleteProjectImages(filePaths: string[]): Promise<void> {
    try {
      await deleteImage(STORAGE_BUCKETS.PROJECT_IMAGES, filePaths);
    } catch (error) {
      console.error('Error deleting project images:', error);
      throw new Error('Failed to delete images from storage');
    }
  }

  // Get project images for a specific project
  async getProjectImages(projectId: string): Promise<{ before?: string; after?: string }> {
    try {
      const { data: files, error } = await supabase.storage
        .from(STORAGE_BUCKETS.PROJECT_IMAGES)
        .list(`projects/${projectId}`, {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('Error listing project images:', error);
        return {};
      }

      const images: { before?: string; after?: string } = {};

      files?.forEach(file => {
        const publicUrl = getPublicImageUrl(
          STORAGE_BUCKETS.PROJECT_IMAGES, 
          `projects/${projectId}/${file.name}`
        );

        if (file.name.startsWith('before_')) {
          images.before = publicUrl;
        } else if (file.name.startsWith('after_')) {
          images.after = publicUrl;
        }
      });

      return images;
    } catch (error) {
      console.error('Error getting project images:', error);
      return {};
    }
  }

  // Clean up orphaned images (images not referenced in database)
  async cleanupOrphanedImages(): Promise<void> {
    try {
      // Get all project IDs from database
      const { data: projects, error: dbError } = await supabase
        .from('projects')
        .select('id');

      if (dbError) {
        console.error('Error fetching projects from database:', dbError);
        return;
      }

      const validProjectIds = new Set(projects?.map(p => p.id.toString()) || []);

      // Get all folders in storage
      const { data: folders, error: storageError } = await supabase.storage
        .from(STORAGE_BUCKETS.PROJECT_IMAGES)
        .list('projects', { limit: 1000, offset: 0 });

      if (storageError) {
        console.error('Error listing storage folders:', storageError);
        return;
      }

      // Find orphaned folders
      const orphanedFolders = folders?.filter(folder => 
        !validProjectIds.has(folder.name)
      ) || [];

      // Delete orphaned folders and their contents
      for (const folder of orphanedFolders) {
        try {
          const { data: files } = await supabase.storage
            .from(STORAGE_BUCKETS.PROJECT_IMAGES)
            .list(`projects/${folder.name}`, { limit: 100, offset: 0 });

          if (files && files.length > 0) {
            const filePaths = files.map(file => `projects/${folder.name}/${file.name}`);
            await deleteImage(STORAGE_BUCKETS.PROJECT_IMAGES, filePaths);
            console.log(`🗑️ Cleaned up orphaned images for project ${folder.name}`);
          }
        } catch (error) {
          console.error(`Error cleaning up folder ${folder.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    bucketSize: number;
  }> {
    try {
      let totalFiles = 0;
      let totalSize = 0;
      let offset = 0;
      const limit = 1000;

      while (true) {
        const { data: files, error } = await supabase.storage
          .from(STORAGE_BUCKETS.PROJECT_IMAGES)
          .list('projects', {
            limit,
            offset,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (error) break;
        if (!files || files.length === 0) break;

        totalFiles += files.length;
        totalSize += files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
        
        if (files.length < limit) break;
        offset += limit;
      }

      // Get bucket info
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucket = buckets?.find(b => b.name === STORAGE_BUCKETS.PROJECT_IMAGES);
      const bucketSize = bucket?.file_size_limit || 0;

      return {
        totalFiles,
        totalSize,
        bucketSize
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { totalFiles: 0, totalSize: 0, bucketSize: 0 };
    }
  }
}

export default StorageService.getInstance();