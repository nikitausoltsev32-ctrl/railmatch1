'use client';

import { useState } from 'react';
import { DealStatus, Match } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type MatchWithStatus = Match & {
  offer: {
    id: number;
    company: {
      name: string;
    };
    pricePerWagon: number;
  };
  request: {
    id: number;
    company: {
      name: string;
    };
  };
  currentStatus: DealStatus;
  lastMessage: {
    content: string;
    createdAt: Date;
  } | null;
  latestHistory: {
    status: DealStatus;
    comment: string | null;
    createdAt: Date;
  } | null;
};

interface ResponsesContentProps {
  initialResponses: MatchWithStatus[];
  companyType: 'operator' | 'seeker';
  companyId: number;
}

const statusColors: Record<DealStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  NEGOTIATING: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export function ResponsesContent({ 
  initialResponses, 
  companyType, 
  companyId 
}: ResponsesContentProps) {
  const [responses, setResponses] = useState(initialResponses);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter responses by status
  const filteredResponses = responses.filter(response => {
    if (selectedFilter === 'all') return true;
    
    const statusMap: Record<string, DealStatus> = {
      new: 'PENDING',
      negotiating: 'NEGOTIATING',
      accepted: 'ACCEPTED',
      rejected: 'REJECTED',
      completed: 'COMPLETED',
      cancelled: 'CANCELLED',
    };
    
    return response.currentStatus === statusMap[selectedFilter];
  });

  const ResponseCard = ({ response }: { response: MatchWithStatus }) => {
    const isOperator = companyType === 'operator';
    const otherParty = isOperator ? response.request.company : response.offer.company;
    const myEntity = isOperator ? response.offer : response.request;
    
    const statusLabels: Record<DealStatus, string> = {
      PENDING: 'В ожидании',
      NEGOTIATING: 'В переговорах',
      ACCEPTED: 'Принято',
      REJECTED: 'Отклонено',
      COMPLETED: 'Завершено',
      CANCELLED: 'Отменено',
    };
    
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-neutral-900">
                {isOperator ? 'Заявка' : 'Предложение'}: {myEntity.id}
              </h3>
              <Badge className={statusColors[response.currentStatus]}>
                {statusLabels[response.currentStatus]}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-neutral-600">
              <p>
                <span className="font-medium">Оператор:</span> {otherParty.name}
              </p>
              <p>
                <span className="font-medium">Оценка совпадения:</span> {Math.round(response.score * 100)}/100
              </p>
              {response.lastMessage && (
                <p>
                  <span className="font-medium">Последнее сообщение:</span> {response.lastMessage.content.substring(0, 100)}
                  {response.lastMessage.content.length > 100 ? '...' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Ответить
          </Button>
          <Button variant="outline" size="sm">
            Предложить условия
          </Button>
        </div>
      </Card>
    );
  };

  // Filter labels
  const filterLabels = {
    all: 'Все статусы',
    new: 'Новые',
    negotiating: 'В переговорах',
    accepted: 'Принято',
    rejected: 'Отклонено',
    completed: 'Завершено',
    cancelled: 'Закрыто',
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-700">Статус:</span>
        <div className="flex gap-2">
          {Object.entries(filterLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedFilter(key)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedFilter === key
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Responses List */}
      {filteredResponses.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-neutral-500">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Нет откликов
            </h3>
            <p>
              Когда искатели откликнутся на ваши предложения, они появятся здесь
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map(response => (
            <ResponseCard key={response.id} response={response} />
          ))}
        </div>
      )}
    </div>
  );
}