/**
 * Sanitizes a name to be compatible with external APIs
 * Only allows: a-z, 0-9, and hyphens
 * 
 * @param name - The original name to sanitize
 * @returns The sanitized name
 * 
 * @example
 * sanitizeInboxName('WhatsApp Atendimento') // 'whatsapp-atendimento'
 * sanitizeInboxName('API @#$ Test') // 'api-test'
 */
export const sanitizeInboxName = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()                    // Convert to lowercase
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')       // Remove special chars
    .replace(/-+/g, '-')              // Squeeze consecutive hyphens
    .replace(/^-|-$/g, '');           // Remove leading/trailing hyphens
};

