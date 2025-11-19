'use client';

import { useEffect, useRef } from 'react';
import { MessageResponse } from '@/lib/chat/types';
import { getFileIcon, formatFileSize } from '@/lib/chat/helpers';
import { copy } from '@/lib/i18n/ru';

interface MessageViewProps {
  messages: MessageResponse[];
  userId: number;
  loading: boolean;
}

export function MessageView({ messages, userId, loading }: MessageViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatCopy = (copy as any).chat;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const groupMessagesByDate = (messages: MessageResponse[]) => {
    const groups: Array<{ date: string; messages: MessageResponse[] }> = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();
      const existingGroup = groups.find(g => g.date === messageDate);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }
    });
    
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return chatCopy.messages.today;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return chatCopy.messages.yesterday;
    } else {
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
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

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messageGroups.length === 0 ? (
        <div className="flex items-center justify-center h-full">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="text-sm font-medium text-neutral-900 mb-1">
              {chatCopy.empty.noMessages.title}
            </h3>
            <p className="text-sm text-neutral-600">
              {chatCopy.empty.noMessages.description}
            </p>
          </div>
        </div>
      ) : (
        messageGroups.map((group, groupIndex) => (
          <div key={group.date}>
            {/* Date Header */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-neutral-100 px-3 py-1 rounded-full">
                <span className="text-xs font-medium text-neutral-600">
                  {formatDateHeader(group.date)}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {group.messages.map((message) => {
                const isOwn = message.senderId === userId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
                      {/* Sender Name (only for other people's messages) */}
                      {!isOwn && (
                        <div className="text-xs text-neutral-600 mb-1">
                          {message.sender.name}
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div
                        className={`
                          px-4 py-2 rounded-2xl
                          ${isOwn 
                            ? 'bg-primary-600 text-white rounded-br-sm' 
                            : 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
                          }
                        `}
                      >
                        {/* Message Content */}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className={`
                                  flex items-center p-2 rounded-lg text-sm
                                  ${isOwn 
                                    ? 'bg-primary-700 bg-opacity-50' 
                                    : 'bg-white border border-neutral-200'
                                  }
                                `}
                              >
                                <span className="text-lg mr-2">
                                  {getFileIcon(attachment.mimeType)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {attachment.filename}
                                  </p>
                                  <p className="text-xs opacity-75">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                                <a
                                  href={attachment.storagePath}
                                  download={attachment.filename}
                                  className={`
                                    ml-2 px-2 py-1 text-xs rounded transition-colors
                                    ${isOwn 
                                      ? 'bg-primary-800 hover:bg-primary-900 text-white' 
                                      : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
                                    }
                                  `}
                                >
                                  {chatCopy.messages.download}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <div className={`text-xs text-neutral-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatMessageTime(message.createdAt)}
                        {isOwn && (
                          <span className="ml-2">
                            {chatCopy.messages.you}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
      
      {/* Scroll Anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}