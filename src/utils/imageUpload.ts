/**
 * Utility functions for uploading images to cloud storage using SAS URLs
 */

export interface GenerateSasRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
  userId: string;
}

export interface GenerateSasResponse {
  sasUrl?: string;
  blobUrl?: string;
  uploadUrl?: string;
  url?: string;
  fileName?: string;
  success?: boolean;
  message?: string;
}

/**
 * Generates a SAS URL for uploading an image
 * @param fileName - Name of the file to upload
 * @param contentType - MIME type of the file (e.g., 'image/png')
 * @param fileSize - Size of the file in bytes
 * @param userId - User ID making the request
 * @returns SAS URL and blob URL for the upload
 */
export async function generateUploadSas(
  fileName: string,
  contentType: string,
  fileSize: number,
  userId: string
): Promise<GenerateSasResponse> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/VideoComment/generate-upload-sas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        contentType,
        fileSize,
        userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate SAS URL (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Extract Data from response structure: { StatusCode, Success, Message, Data: { BlobUrl, UploadUrl, FileName } }
    if (data.Data) {
      return {
        blobUrl: data.Data.BlobUrl,
        uploadUrl: data.Data.UploadUrl,
        fileName: data.Data.FileName,
        success: data.Success,
        message: data.Message,
      };
    }
    
    // Fallback for different response structures
    return {
      blobUrl: data.blobUrl || data.BlobUrl || data.url,
      uploadUrl: data.uploadUrl || data.UploadUrl || data.sasUrl,
      fileName: data.fileName || data.FileName,
      success: data.success || data.Success,
      message: data.message || data.Message,
    };
  } catch (error: any) {
    console.error('[ImageUpload] Error generating SAS URL:', error);
    throw error;
  }
}

/**
 * Converts a base64 data URL to a Blob
 * @param dataUrl - Base64 data URL (e.g., 'data:image/png;base64,...')
 * @returns Blob object
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Uploads an image to blob storage using a SAS URL
 * @param blob - Blob to upload
 * @param sasUrl - SAS URL for uploading
 * @returns The final blob URL where the image is accessible
 */
export async function uploadImageToBlob(blob: Blob, sasUrl: string): Promise<string> {
  try {
    const response = await fetch(sasUrl, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': blob.type,
      },
      body: blob,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload image (${response.status}): ${errorText}`);
    }

    // Extract the blob URL from the SAS URL (remove query parameters)
    const blobUrl = sasUrl.split('?')[0];
    return blobUrl;
  } catch (error: any) {
    console.error('[ImageUpload] Error uploading image:', error);
    throw error;
  }
}

/**
 * Uploads a base64 image to cloud storage
 * @param dataUrl - Base64 data URL of the image
 * @param fileName - Desired file name (will be sanitized)
 * @param userId - User ID making the request
 * @returns Object containing the blob URL and file size
 */
export async function uploadBase64Image(
  dataUrl: string,
  fileName: string,
  userId: string
): Promise<{ url: string; size: number; type: string }> {
  try {
    // Convert data URL to blob
    const blob = dataUrlToBlob(dataUrl);
    
    // Sanitize file name
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.(png|jpg|jpeg)$/i, '')
      .concat('.png'); // Always use PNG for consistency
    
    // Generate SAS URL
    const sasResponse = await generateUploadSas(
      sanitizedFileName,
      blob.type,
      blob.size,
      userId
    );

    // Extract UploadUrl (SAS URL) and BlobUrl from response
    const uploadUrl = sasResponse.uploadUrl;
    const blobUrl = sasResponse.blobUrl;

    if (!uploadUrl) {
      throw new Error('Upload URL (SAS URL) not found in response');
    }

    if (!blobUrl) {
      throw new Error('Blob URL not found in response');
    }

    // Upload image using the SAS URL
    await uploadImageToBlob(blob, uploadUrl);
    
    // Return the BlobUrl (final URL without SAS tokens) for storing in the comment
    return {
      url: blobUrl,
      size: blob.size,
      type: blob.type,
    };
  } catch (error: any) {
    console.error('[ImageUpload] Error uploading base64 image:', error);
    throw error;
  }
}

