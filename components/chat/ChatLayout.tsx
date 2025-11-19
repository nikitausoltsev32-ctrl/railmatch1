'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ThreadResponse, MessageResponse, PollingResponse } from '@/lib/chat/types';
import { ThreadList } from './ThreadList';
import { MessageView } from './MessageView';
import { MessageComposer } from './MessageComposer';
import { copy } from '@/lib/i18n/ru';

interface ChatLayoutProps {
  userId: number;
  userRole: 'OPERATOR' | 'SEEKER';
  initialThreads?: ThreadResponse[];
}

export function ChatLayout({ userId, userRole, initialThreads = [] }: ChatLayoutProps) {
  const [threads, setThreads] = useState<ThreadResponse[]>(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const chatCopy = (copy as any).chat;

  // Fetch threads
  const fetchThreads = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/threads', {
        headers: {
          'x-user-id': userId.toString(),
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке чатов');
      }

      const data = await response.json();
      setThreads(data.threads || []);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError(err instanceof Error ? err.message : chatCopy.error);
    }
  }, [userId, chatCopy.error]);

  // Fetch messages (polling)
  const fetchMessages = useCallback(async (isPolling = false) => {
    if (!selectedThreadId) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const params = new URLSearchParams({
        threadId: selectedThreadId.toString(),
        limit: '50',
      });

      if (lastTimestamp && isPolling) {
        params.append('since', lastTimestamp);
      }

      const response = await fetch(`/api/chat/messages?${params}`, {
        headers: {
          'x-user-id': userId.toString(),
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке сообщений');
      }

      const data: PollingResponse = await response.json();

      if (isPolling) {
        // Append new messages
        setMessages(prev => [...prev, ...data.messages]);
      } else {
        // Replace all messages
        setMessages(data.messages);
      }

      if (data.messages.length > 0) {
        setLastTimestamp(data.lastTimestamp);
      }

      setIsOnline(true);
      setError(null);

      // Schedule next poll
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setTimeout(() => {
        fetchMessages(true);
      }, data.nextPoll);

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching messages:', err);
        setIsOnline(false);
        setError(err instanceof Error ? err.message : chatCopy.messages.pollError);
        
        // Retry polling after 10 seconds on error
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        pollingIntervalRef.current = setTimeout(() => {
          fetchMessages(true);
        }, 10000);
      }
    }
  }, [selectedThreadId, lastTimestamp, userId, chatCopy.messages.pollError]);

  // Send message
  const sendMessage = useCallback(async (content: string, files: File[] = []) => {
    if (!selectedThreadId || !content.trim()) return;

    setSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('threadId', selectedThreadId.toString());
      formData.append('content', content.trim());

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'x-user-id': userId.toString(),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при отправке сообщения');
      }

      const newMessage: MessageResponse = await response.json();
      setMessages(prev => [...prev, newMessage]);
      setLastTimestamp(newMessage.createdAt);

      // Refresh threads to update last message and unread counts
      await fetchThreads();

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : chatCopy.messages.failed);
    } finally {
      setSending(false);
    }
  }, [selectedThreadId, userId, fetchThreads, chatCopy.messages.failed]);

  // Handle thread selection
  const handleThreadSelect = useCallback((threadId: number) => {
    setSelectedThreadId(threadId);
    setMessages([]);
    setLastTimestamp(null);
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Start polling when thread is selected
  useEffect(() => {
    if (selectedThreadId) {
      fetchMessages(false);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedThreadId, fetchMessages]);

  // Pause polling when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      } else if (!document.hidden && selectedThreadId) {
        fetchMessages(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedThreadId, fetchMessages]);

  const selectedThread = threads.find(t => t.id === selectedThreadId);

  return (
    <div className="flex h-full bg-white border border-neutral-200 rounded-lg overflow-hidden">
      {/* Thread List */}
      <div className="w-80 border-r border-neutral-200 flex flex-col">
        <ThreadList
          threads={threads}
          selectedThreadId={selectedThreadId}
          onThreadSelect={handleThreadSelect}
          loading={loading}
          userId={userId}
        />
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Thread Header */}
            <div className="px-6 py-4 border-b border-neutral-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {selectedThread.subject}
                  </h2>
                  <div className="text-sm text-neutral-600 mt-1">
                    {userRole === 'OPERATOR' ? (
                      selectedThread.seeker ? (
                        <>
                          {selectedThread.seeker.name}
                          {selectedThread.seeker.company && (
                            <span className="text-neutral-500">
                              {' • '}{selectedThread.seeker.company.name}
                            </span>
                          )}
                        </>
                      ) : 'Неизвестный участник'
                    ) : (
                      selectedThread.operator ? (
                        <>
                          {selectedThread.operator.name}
                          {selectedThread.operator.company && (
                            <span className="text-neutral-500">
                              {' • '}{selectedThread.operator.company.name}
                            </span>
                          )}
                        </>
                      ) : 'Неизвестный участник'
                    )}
                  </div>
                </div>
                {!isOnline && (
                  <div className="flex items-center text-sm text-amber-600">
                    <div className="w-2 h-2 bg-amber-600 rounded-full mr-2 animate-pulse" />
                    {chatCopy.polling.reconnecting}
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <MessageView
              messages={messages}
              userId={userId}
              loading={loading && messages.length === 0}
            />

            {/* Error Display */}
            {error && (
              <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Message Composer */}
            <MessageComposer
              onSendMessage={sendMessage}
              disabled={sending}
              placeholder={chatCopy.composer.placeholder}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-neutral-300 mb-4"
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
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {chatCopy.empty.title}
              </h3>
              <p className="text-neutral-600">
                {chatCopy.empty.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}