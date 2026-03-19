export interface AttachmentFile {
  id: string;
  file_url: string;
  data_url?: string;
  thumb_url?: string;
  file_type: string;
  file_size: number;
  extension?: string;
  fallback_title?: string;
}

export interface UploadProgress {
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
}

export interface AttachmentUpload {
  id: string;
  file: File;
  preview?: string;
  progress: UploadProgress;
}

export type AttachmentType = 'image' | 'video' | 'audio' | 'file';

export interface AttachmentValidation {
  maxSize: number; // in bytes
  allowedTypes: string[];
}

export const DEFAULT_ATTACHMENT_VALIDATION: AttachmentValidation = {
  maxSize: 40 * 1024 * 1024, // 40MB
  allowedTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
  ]
};

export const getAttachmentType = (mimeType: string): AttachmentType => {
  // Handle null/undefined
  if (!mimeType) return 'file';
  
  // Convert to lowercase for comparison
  const type = mimeType.toLowerCase();
  
  // Check for simplified types from backend
  if (type === 'image' || type.startsWith('image/')) return 'image';
  if (type === 'video' || type.startsWith('video/')) return 'video';
  if (type === 'audio' || type.startsWith('audio/')) return 'audio';
  
  // Default to file
  return 'file';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFile = (file: File, validation: AttachmentValidation = DEFAULT_ATTACHMENT_VALIDATION): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > validation.maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(validation.maxSize)})`
    };
  }

  // Check file type
  if (!validation.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed`
    };
  }

  return { valid: true };
};