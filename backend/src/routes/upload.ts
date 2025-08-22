import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import StorageService from '../services/storageService';
import { supabase } from '../config/database';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads (memory storage for Supabase)
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only image files
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    files: 5 // Maximum 5 files per request
  }
});

// Single file upload to Supabase Storage
router.post('/single', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const { projectId, imageType = 'before' } = req.body;
    
    if (!projectId) {
      throw createError('Project ID is required', 400);
    }

    // Validate imageType
    if (!['before', 'after'].includes(imageType)) {
      throw createError('Image type must be either "before" or "after"', 400);
    }

    // Upload to Supabase Storage
    const uploadResult = await StorageService.uploadProjectImage(
      req.file,
      projectId,
      imageType,
      req.user?.employeeId || 'unknown'
    );

    // Update project record with image URL
    const updateField = imageType === 'before' ? 'before_project_image' : 'after_project_image';
    const { error: updateError } = await supabase
      .from('projects')
      .update({ [updateField]: uploadResult.publicUrl })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project with image URL:', updateError);
      // Don't throw error here as the image is already uploaded
    }

    const fileInfo = {
      originalName: req.file.originalname,
      filename: uploadResult.fileName,
      filePath: uploadResult.filePath,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: uploadResult.publicUrl,
      imageType,
      projectId,
      uploadedBy: req.user?.employeeId,
      uploadedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: fileInfo,
      message: 'File uploaded successfully to Supabase Storage'
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    if (error instanceof Error && (error as any).statusCode) {
      res.status((error as any).statusCode).json({
        success: false,
        error: { message: error.message, statusCode: (error as any).statusCode }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'File upload failed', statusCode: 500 }
      });
    }
  }
});

// Multiple files upload for project (before & after images)
router.post('/multiple', authenticateToken, upload.array('files', 2), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw createError('No files uploaded', 400);
    }

    const { projectId } = req.body;
    
    if (!projectId) {
      throw createError('Project ID is required', 400);
    }

    // Upload files to Supabase Storage
    const uploadResults = await StorageService.uploadMultipleProjectImages(
      files,
      projectId,
      req.user?.employeeId || 'unknown'
    );

    // Update project record with image URLs
    const updateData: any = {};
    
    uploadResults.forEach((result, index) => {
      const imageType = files[index].fieldname === 'beforeImage' || index === 0 ? 'before' : 'after';
      const field = imageType === 'before' ? 'before_project_image' : 'after_project_image';
      updateData[field] = result.publicUrl;
    });

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (updateError) {
        console.error('Error updating project with image URLs:', updateError);
      }
    }

    const filesInfo = uploadResults.map((result, index) => ({
      originalName: files[index].originalname,
      filename: result.fileName,
      filePath: result.filePath,
      mimetype: files[index].mimetype,
      size: files[index].size,
      url: result.publicUrl,
      imageType: index === 0 ? 'before' : 'after',
      projectId,
      uploadedBy: req.user?.employeeId,
      uploadedAt: new Date().toISOString()
    }));

    res.json({
      success: true,
      data: {
        files: filesInfo,
        count: filesInfo.length
      },
      message: `${filesInfo.length} files uploaded successfully to Supabase Storage`
    });

  } catch (error) {
    console.error('Multiple files upload error:', error);
    
    if (error instanceof Error && (error as any).statusCode) {
      res.status((error as any).statusCode).json({
        success: false,
        error: { message: error.message, statusCode: (error as any).statusCode }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Files upload failed', statusCode: 500 }
      });
    }
  }
});

// Get project images
router.get('/project/:projectId/images', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const images = await StorageService.getProjectImages(projectId);

    res.json({
      success: true,
      data: images,
      message: 'Project images retrieved successfully'
    });

  } catch (error) {
    console.error('Get project images error:', error);
    
    if (error instanceof Error && (error as any).statusCode) {
      res.status((error as any).statusCode).json({
        success: false,
        error: { message: error.message, statusCode: (error as any).statusCode }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get project images', statusCode: 500 }
      });
    }
  }
});

// Delete project image
router.delete('/project/:projectId/image/:imageType', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { projectId, imageType } = req.params;

    if (!['before', 'after'].includes(imageType)) {
      throw createError('Invalid image type. Must be "before" or "after"', 400);
    }

    // Get current project to find image path
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('before_project_image, after_project_image')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw createError('Project not found', 404);
    }

    const imageUrl = imageType === 'before' ? project.before_project_image : project.after_project_image;
    
    if (!imageUrl) {
      throw createError(`No ${imageType} image found for this project`, 404);
    }

    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex((part: string) => part === 'project-images');
    if (bucketIndex === -1) {
      throw createError('Invalid image URL format', 400);
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Delete from Supabase Storage
    await StorageService.deleteProjectImage(filePath);

    // Update project record to remove image URL
    const updateField = imageType === 'before' ? 'before_project_image' : 'after_project_image';
    const { error: updateError } = await supabase
      .from('projects')
      .update({ [updateField]: null })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project after image deletion:', updateError);
    }

    res.json({
      success: true,
      message: `${imageType} image deleted successfully`
    });

  } catch (error) {
    console.error('Delete project image error:', error);
    
    if (error instanceof Error && (error as any).statusCode) {
      res.status((error as any).statusCode).json({
        success: false,
        error: { message: error.message, statusCode: (error as any).statusCode }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete image', statusCode: 500 }
      });
    }
  }
});

// Storage statistics (Admin only)
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'Admin') {
      throw createError('Insufficient permissions', 403);
    }

    const stats = await StorageService.getStorageStats();

    res.json({
      success: true,
      data: stats,
      message: 'Storage statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Get storage stats error:', error);
    
    if (error instanceof Error && (error as any).statusCode) {
      res.status((error as any).statusCode).json({
        success: false,
        error: { message: error.message, statusCode: (error as any).statusCode }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get storage statistics', statusCode: 500 }
      });
    }
  }
});

// Delete file (legacy route for local files)
router.delete('/:filename', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw createError('Invalid filename', 400);
    }

    const filePath = path.join(uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw createError('File not found', 404);
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    
    if (error instanceof Error && (error as any).statusCode) {
      res.status((error as any).statusCode).json({
        success: false,
        error: { message: error.message, statusCode: (error as any).statusCode }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'File deletion failed', statusCode: 500 }
      });
    }
  }
});

// Get file info
router.get('/info/:filename', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw createError('Invalid filename', 400);
    }

    const filePath = path.join(uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw createError('File not found', 404);
    }

    const stats = fs.statSync(filePath);
    const fileInfo = {
      filename,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      url: `/uploads/${filename}`
    };

    res.json({
      success: true,
      data: fileInfo,
      message: 'File info retrieved successfully'
    });

  } catch (error) {
    console.error('Get file info error:', error);
    
    if (error instanceof Error && (error as any).statusCode) {
      res.status((error as any).statusCode).json({
        success: false,
        error: { message: error.message, statusCode: (error as any).statusCode }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get file info', statusCode: 500 }
      });
    }
  }
});

// List all uploaded files (Admin only)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'Admin') {
      throw createError('Insufficient permissions', 403);
    }

    const files = fs.readdirSync(uploadDir);
    const filesInfo = files.map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: `/uploads/${filename}`
      };
    });

    res.json({
      success: true,
      data: {
        files: filesInfo,
        count: filesInfo.length
      },
      message: 'Files list retrieved successfully'
    });

  } catch (error) {
    console.error('List files error:', error);
    
    if (error instanceof Error && (error as any).statusCode) {
      res.status((error as any).statusCode).json({
        success: false,
        error: { message: error.message, statusCode: (error as any).statusCode }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to list files', statusCode: 500 }
      });
    }
  }
});

// Handle multer errors
router.use((error: any, req: Request, res: Response, next: any): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: { message: 'File too large', statusCode: 400 }
      });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: { message: 'Too many files', statusCode: 400 }
      });
      return;
    }
  }
  
  res.status(400).json({
    success: false,
    error: { message: error.message || 'Upload error', statusCode: 400 }
  });
});

export default router;