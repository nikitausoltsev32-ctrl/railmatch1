import { FileAttachment } from './types';

export function parseAttachments(attachmentsJson: string | null): FileAttachment[] {
  if (!attachmentsJson) {
    return [];
  }

  try {
    return JSON.parse(attachmentsJson) as FileAttachment[];
  } catch (error) {
    console.error('Error parsing attachments:', error);
    return [];
  }
}

export function serializeAttachments(attachments: FileAttachment[]): string {
  return JSON.stringify(attachments);
}

export function shouldMaskContacts(
  operatorId: number | null,
  seekerId: number | null,
  messages: Array<{ senderId: number }>
): boolean {
  // If either participant is missing, we can't determine masking
  if (!operatorId || !seekerId) {
    return true;
  }

  // Check if both parties have sent at least one message
  const hasOperatorMessage = messages.some(msg => msg.senderId === operatorId);
  const hasSeekerMessage = messages.some(msg => msg.senderId === seekerId);

  return !(hasOperatorMessage && hasSeekerMessage);
}

export function updateLastReadTimestamp(
  lastReadAtJson: string | null,
  userId: number
): string {
  let lastReadAt: Record<string, string> = {};
  
  if (lastReadAtJson) {
    try {
      lastReadAt = JSON.parse(lastReadAtJson);
    } catch (error) {
      console.error('Error parsing lastReadAt:', error);
    }
  }

  lastReadAt[userId.toString()] = new Date().toISOString();
  
  return JSON.stringify(lastReadAt);
}

export function calculateUnreadCount(
  messages: Array<{ createdAt: string; senderId: number }>,
  lastReadAtJson: string | null,
  userId: number
): number {
  if (!lastReadAtJson) {
    return messages.filter(msg => msg.senderId !== userId).length;
  }

  try {
    const lastReadAt = JSON.parse(lastReadAtJson);
    const userLastRead = lastReadAt[userId.toString()];
    
    if (!userLastRead) {
      return messages.filter(msg => msg.senderId !== userId).length;
    }

    const lastReadDate = new Date(userLastRead);
    
    return messages.filter(msg => 
      msg.senderId !== userId && 
      new Date(msg.createdAt) > lastReadDate
    ).length;
  } catch (error) {
    console.error('Error calculating unread count:', error);
    return messages.filter(msg => msg.senderId !== userId).length;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Б';
  
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return '🖼️';
  }
  
  if (mimeType.includes('pdf')) {
    return '📄';
  }
  
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return '📝';
  }
  
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return '📊';
  }
  
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
    return '📦';
  }
  
  if (mimeType.startsWith('text/')) {
    return '📄';
  }
  
  return '📎';
}