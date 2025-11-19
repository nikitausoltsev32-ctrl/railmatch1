import { FileAttachment } from './types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  
  // Text
  'text/plain',
  'text/csv',
];

export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'Размер файла не должен превышать 5 МБ',
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Неподдерживаемый тип файла',
    };
  }

  return { isValid: true };
}

export function generateSafeFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop() || '';
  const nameWithoutExt = originalFilename.replace(`.${extension}`, '');
  
  // Sanitize filename
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
  
  return `${sanitizedName}_${timestamp}_${randomSuffix}.${extension}`;
}

export async function saveFile(file: File): Promise<FileAttachment> {
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const storagePath = generateSafeFilename(file.name);
  const uploadDir = process.env.UPLOAD_DIR || './public/uploads/chat';
  
  // Ensure upload directory exists
  const fs = require('fs').promises;
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  const fullPath = `${uploadDir}/${storagePath}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  
  await fs.writeFile(fullPath, buffer);

  return {
    filename: file.name,
    size: file.size,
    mimeType: file.type,
    storagePath: `/uploads/chat/${storagePath}`,
  };
}

export async function deleteFile(storagePath: string): Promise<void> {
  const fs = require('fs').promises;
  const fullPath = storagePath.startsWith('/uploads/chat/') 
    ? `./public${storagePath}`
    : storagePath;
  
  try {
    await fs.unlink(fullPath);
  } catch (error) {
    // File might not exist
  }
}

export function maskContact(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) {
    return email; // Invalid email format, return as is
  }
  
  const [localPart, domain] = parts;
  if (!localPart || !domain) {
    return email; // Invalid parts, return as is
  }

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  const maskedMiddle = '*'.repeat(localPart.length - 2);
  
  return `${firstChar}${maskedMiddle}${lastChar}@${domain}`;
}