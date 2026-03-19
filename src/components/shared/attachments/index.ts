export { default as SharedImageBubble } from './SharedImageBubble';
export { default as SharedAudioBubble } from './SharedAudioBubble';
export { default as SharedVideoBubble } from './SharedVideoBubble';
export { default as SharedFileBubble } from './SharedFileBubble';
export type { SharedAttachment } from './SharedImageBubble';

// Helper function for attachment type detection
export const getAttachmentType = (mimeType: string): 'image' | 'video' | 'audio' | 'file' => {
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