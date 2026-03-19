export interface FileData {
  filename: string;
  content_type: string;
  data: string;
  size: number;
  preview_url?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

