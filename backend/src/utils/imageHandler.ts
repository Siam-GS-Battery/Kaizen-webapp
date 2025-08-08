import { supabaseAdmin, STORAGE_BUCKETS, getPublicImageUrl } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface ImageUploadResult {
  url: string | null;
  error?: string;
}

/**
 * Converts base64 image data to a Buffer
 */
function base64ToBuffer(base64Data: string): Buffer {
  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Content = base64Data.includes(',') 
    ? base64Data.split(',')[1] 
    : base64Data;
  
  return Buffer.from(base64Content, 'base64');
}

/**
 * Extracts mime type from base64 data URL
 */
function getMimeTypeFromBase64(base64Data: string): string {
  if (!base64Data.includes('data:')) {
    return 'image/jpeg'; // Default
  }
  
  const matches = base64Data.match(/data:([^;]+);base64,/);
  return matches ? matches[1] : 'image/jpeg';
}

/**
 * Gets file extension from mime type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg', 
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp'
  };
  
  return extensions[mimeType] || '.jpg';
}

/**
 * Uploads an image to Supabase storage and returns the public URL
 * @param base64Data Base64 encoded image data (with or without data URL prefix)
 * @param projectId Project ID for organizing files
 * @param imageType 'before' or 'after' for file naming
 * @returns Promise with image URL or error
 */
export async function uploadProjectImage(
  base64Data: string | null,
  projectId: number,
  imageType: 'before' | 'after'
): Promise<ImageUploadResult> {
  if (!base64Data) {
    return { url: null };
  }

  if (!supabaseAdmin) {
    return { url: null, error: 'Database admin client not available' };
  }

  try {
    // Convert base64 to buffer
    const imageBuffer = base64ToBuffer(base64Data);
    const mimeType = getMimeTypeFromBase64(base64Data);
    const extension = getExtensionFromMimeType(mimeType);
    
    // Generate unique filename
    const fileName = `${projectId}/${imageType}-${uuidv4()}${extension}`;
    
    // Upload to Supabase storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.PROJECT_IMAGES)
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return { url: null, error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const publicUrl = getPublicImageUrl(STORAGE_BUCKETS.PROJECT_IMAGES, fileName);
    
    return { url: publicUrl };
  } catch (error) {
    console.error('Image processing error:', error);
    return { url: null, error: `Processing failed: ${error}` };
  }
}

/**
 * Deletes an image from storage using its URL
 * @param imageUrl Public URL of the image to delete
 * @returns Promise indicating success/failure
 */
export async function deleteProjectImage(imageUrl: string | null): Promise<boolean> {
  if (!imageUrl || !supabaseAdmin) {
    return true; // Nothing to delete or can't delete
  }

  try {
    // Extract file path from public URL
    const urlParts = imageUrl.split('/storage/v1/object/public/project-images/');
    if (urlParts.length !== 2) {
      console.error('Invalid image URL format:', imageUrl);
      return false;
    }

    const filePath = urlParts[1];
    
    // Delete from storage
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.PROJECT_IMAGES)
      .remove([filePath]);

    if (error) {
      console.error('Image deletion error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image deletion processing error:', error);
    return false;
  }
}