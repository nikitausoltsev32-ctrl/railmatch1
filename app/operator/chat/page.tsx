'use client';

import { useState, useEffect } from 'react';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { copy } from '@/lib/i18n/ru';

// Mock user data for development - replace with real auth
const MOCK_OPERATOR_ID = 6; // dispatcher@zhd-logistics.ru - Петрова Мария Сергеевна

export default function OperatorChatPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chatCopy = (copy as any).chat;

  useEffect(() => {
    // TODO: Replace with real authentication
    // For now, using mock data
    const initializeUser = async () => {
      try {
        // Mock authentication - replace with real auth logic
        setUserId(MOCK_OPERATOR_ID);
      } catch (err) {
        console.error('Error initializing user:', err);
        setError('Ошибка авторизации');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4" />
          <p className="text-neutral-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ошибка</h3>
          <p className="text-neutral-600">{error || 'Не удалось загрузить чат'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{chatCopy.title}</h1>
        <p className="text-neutral-600 mt-1">{chatCopy.subtitle}</p>
      </div>
      
      <div className="h-[calc(100vh-200px)]">
        <ChatLayout 
          userId={userId} 
          userRole="OPERATOR"
        />
      </div>
    </div>
  );
}