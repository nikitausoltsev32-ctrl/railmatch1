'use client';

import { ThreadResponse } from '@/lib/chat/types';
import { copy } from '@/lib/i18n/ru';

interface ThreadListProps {
  threads: ThreadResponse[];
  selectedThreadId: number | null;
  onThreadSelect: (threadId: number) => void;
  loading: boolean;
  userId: number;
}

export function ThreadList({ 
  threads, 
  selectedThreadId, 
  onThreadSelect, 
  loading, 
  userId 
}: ThreadListProps) {
  const chatCopy = (copy as any).chat;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return chatCopy.messages.yesterday;
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  const getOtherParticipant = (thread: ThreadResponse) => {
    if (userId === thread.operatorId) {
      return thread.seeker;
    } else {
      return thread.operator;
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4" />
          <p className="text-sm text-neutral-600">{chatCopy.loading}</p>
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-neutral-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-sm font-medium text-neutral-900 mb-1">
            {chatCopy.threads.empty.title}
          </h3>
          <p className="text-xs text-neutral-600">
            {chatCopy.threads.empty.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <h2 className="font-semibold text-neutral-900">{chatCopy.threads.title}</h2>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => {
          const participant = getOtherParticipant(thread);
          const isSelected = thread.id === selectedThreadId;
          
          return (
            <div
              key={thread.id}
              onClick={() => onThreadSelect(thread.id)}
              className={`
                px-4 py-3 border-b border-neutral-100 cursor-pointer transition-colors
                hover:bg-neutral-50 ${isSelected ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-neutral-900 truncate">
                      {thread.subject}
                    </h3>
                    {thread.updatedAt && (
                      <span className="text-xs text-neutral-500 ml-2 flex-shrink-0">
                        {formatDate(thread.updatedAt)}
                      </span>
                    )}
                  </div>
                  
                  {participant && (
                    <div className="text-sm text-neutral-600 truncate">
                      {participant.name}
                      {participant.company && (
                        <span className="text-neutral-500">
                          {' • '}{participant.company.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {thread.lastMessage && (
                <div className="text-sm text-neutral-600 truncate">
                  {truncateMessage(thread.lastMessage.content)}
                </div>
              )}

              {/* Unread Badge */}
              {thread.unreadCount > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-primary-600 font-medium">
                    {thread.unreadCount} {chatCopy.threads.unread}
                  </div>
                </div>
              )}

              {/* Status Indicator */}
              <div className="flex items-center mt-2">
                <div className={`
                  w-2 h-2 rounded-full mr-2
                  ${thread.isActive ? 'bg-green-500' : 'bg-neutral-300'}
                `} />
                <span className="text-xs text-neutral-500">
                  {thread.isActive ? chatCopy.thread.active : chatCopy.thread.archived}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}