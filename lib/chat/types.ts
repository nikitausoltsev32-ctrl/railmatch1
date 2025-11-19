export interface FileAttachment {
  filename: string;       // Original filename
  size: number;           // File size in bytes
  mimeType: string;       // MIME type (validated)
  storagePath: string;    // Safe filename with timestamp and random suffix
}

export interface ThreadResponse {
  id: number;
  subject: string;
  operatorId: number | null;
  seekerId: number | null;
  operator: {
    id: number;
    name: string;
    email: string;
    company: {
      id: number;
      name: string;
    } | null;
  } | null;
  seeker: {
    id: number;
    name: string;
    email: string;
    company: {
      id: number;
      name: string;
    } | null;
  } | null;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: number;
  };
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  id: number;
  threadId: number;
  senderId: number;
  sender: {
    id: number;
    name: string;
    email: string;
  };
  content: string;
  attachments: FileAttachment[];
  createdAt: string;
}

export interface PollingResponse {
  messages: MessageResponse[];
  nextPoll: number;        // Recommended next poll interval in milliseconds
  hasMore: boolean;        // Whether there are more messages to fetch
  lastTimestamp: string;   // Timestamp of the last message
}

export interface CreateThreadRequest {
  matchId?: number;
  requestId?: number;
  subject: string;
  operatorId?: number;
  seekerId?: number;
}

export interface CreateMessageRequest {
  threadId: number;
  content: string;
  attachments?: File[];
}

export interface ThreadListResponse {
  threads: ThreadResponse[];
  total: number;
}