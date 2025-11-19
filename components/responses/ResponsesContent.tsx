'use client';

import { useState, useMemo } from 'react';
import { copy } from '@/lib/i18n/ru';
import { DealStatus, Match } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProposeConditionsModal } from './ProposeConditionsModal';
import { CloseDealModal } from './CloseDealModal';
import { updateDealStatus } from '@/lib/actions/responses';

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
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<MatchWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter responses by status
  const filteredResponses = useMemo(() => {
    if (selectedFilter === 'all') return responses;
    
    const statusMap: Record<string, DealStatus> = {
      new: 'PENDING',
      negotiating: 'NEGOTIATING',
      accepted: 'ACCEPTED',
      rejected: 'REJECTED',
      completed: 'COMPLETED',
      cancelled: 'CANCELLED',
    };
    
    return responses.filter(response => 
      response.currentStatus === statusMap[selectedFilter]
    );
  }, [responses, selectedFilter]);

  const handleStatusUpdate = async (matchId: number, newStatus: DealStatus, comment?: string) => {
    setIsLoading(true);
    try {
      await updateDealStatus({
        matchId,
        newStatus,
        comment,
        userId: 1, // Mock user ID - in real app this would come from auth
      });

      // Update local state
      setResponses(prev => prev.map(response => 
        response.id === matchId 
          ? { 
              ...response, 
              currentStatus: newStatus,
              latestHistory: {
                status: newStatus,
                comment: comment || null,
                createdAt: new Date(),
              }
            }
          : response
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleProposeConditions = (response: MatchWithStatus) => {
    setSelectedResponse(response);
    setIsProposeModalOpen(true);
  };

  const handleCloseDeal = (response: MatchWithStatus) => {
    setSelectedResponse(response);
    setIsCloseModalOpen(true);
  };

  const getAvailableActions = (response: MatchWithStatus) => {
    const actions = [];
    
    switch (response.currentStatus) {
      case 'PENDING':
        actions.push({
          key: 'reply',
          label: companyType === 'operator' 
            ? copy.operator.responses.actions.reply 
            : copy.seeker.inbox.actions.reply,
          onClick: () => {
            // TODO: Navigate to thread view
            console.log('Navigate to thread for match:', response.id);
          },
        });
        actions.push({
          key: 'propose',
          label: companyType === 'operator' 
            ? copy.operator.responses.actions.proposeConditions 
            : copy.seeker.inbox.actions.proposeConditions,
          onClick: () => handleProposeConditions(response),
        });
        break;
        
      case 'NEGOTIATING':
        actions.push({
          key: 'reply',
          label: companyType === 'operator' 
            ? copy.operator.responses.actions.reply 
            : copy.seeker.inbox.actions.reply,
          onClick: () => {
            // TODO: Navigate to thread view
            console.log('Navigate to thread for match:', response.id);
          },
        });
        actions.push({
          key: 'propose',
          label: companyType === 'operator' 
            ? copy.operator.responses.actions.proposeConditions 
            : copy.seeker.inbox.actions.proposeConditions,
          onClick: () => handleProposeConditions(response),
        });
        actions.push({
          key: 'accept',
          label: companyType === 'operator' 
            ? copy.operator.responses.actions.accept 
            : copy.seeker.inbox.actions.accept,
          onClick: () => handleStatusUpdate(response.id, 'ACCEPTED'),
        });
        actions.push({
          key: 'reject',
          label: companyType === 'operator' 
            ? copy.operator.responses.actions.reject 
            : copy.seeker.inbox.actions.reject,
          onClick: () => handleStatusUpdate(response.id, 'REJECTED'),
        });
        break;
        
      case 'ACCEPTED':
        actions.push({
          key: 'reply',
          label: companyType === 'operator' 
            ? copy.operator.responses.actions.reply 
            : copy.seeker.inbox.actions.reply,
          onClick: () => {
            // TODO: Navigate to thread view
            console.log('Navigate to thread for match:', response.id);
          },
        });
        actions.push({
          key: 'close',
          label: companyType === 'operator' 
            ? copy.operator.responses.actions.close 
            : copy.seeker.inbox.actions.close,
          onClick: () => handleStatusUpdate(response.id, 'COMPLETED'),
        });
        break;
    }
    
    return actions;
  };

  const ResponseCard = ({ response }: { response: MatchWithStatus }) => {
    const isOperator = companyType === 'operator';
    const otherParty = isOperator ? response.request.company : response.offer.company;
    const myEntity = isOperator ? response.offer : response.request;
    
    const cardCopy = isOperator ? copy.operator.responses.responseCard : copy.seeker.inbox.dealCard;
    
    // Status labels mapping
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
          {getAvailableActions(response).map(action => (
            <Button
              key={action.key}
              variant={action.key === 'accept' ? 'primary' : 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={isLoading}
            >
              {action.label}
            </Button>
          ))}
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
              {companyType === 'operator' 
                ? copy.operator.responses.empty.title 
                : copy.seeker.inbox.empty.title}
            </h3>
            <p>
              {companyType === 'operator' 
                ? copy.operator.responses.empty.description 
                : copy.seeker.inbox.empty.description}
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

      {/* Modals */}
      {selectedResponse && (
        <>
          <ProposeConditionsModal
            isOpen={isProposeModalOpen}
            onClose={() => setIsProposeModalOpen(false)}
            response={selectedResponse}
            companyType={companyType}
            onSubmit={async (price, comment) => {
              await handleStatusUpdate(
                selectedResponse.id, 
                'NEGOTIATING', 
                `Предложена цена: ${price}. ${comment}`
              );
              setIsProposeModalOpen(false);
            }}
          />
          
          <CloseDealModal
            isOpen={isCloseModalOpen}
            onClose={() => setIsCloseModalOpen(false)}
            response={selectedResponse}
            companyType={companyType}
            onSubmit={async (reason) => {
              await handleStatusUpdate(
                selectedResponse.id, 
                'CANCELLED', 
                reason
              );
              setIsCloseModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}