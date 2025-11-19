'use client';

import { useState } from 'react';
import { copy } from '@/lib/i18n/ru';
import { DealStatus, Match } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

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
};

interface CloseDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: MatchWithStatus;
  companyType: 'operator' | 'seeker';
  onSubmit: (reason: string) => Promise<void>;
}

export function CloseDealModal({
  isOpen,
  onClose,
  response,
  companyType,
  onSubmit,
}: CloseDealModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalCopy = companyType === 'operator' 
    ? copy.operator.responses.modals.closeDeal 
    : copy.seeker.inbox.modals.closeDeal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reason);
      onClose();
      // Reset form
      setReason('');
    } catch (error) {
      console.error('Error closing deal:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">
          {modalCopy.title}
        </h2>
        <p className="text-neutral-600 text-sm mb-6">
          {modalCopy.description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              label={modalCopy.reasonField}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Укажите причину закрытия сделки..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              {modalCopy.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Закрытие...' : modalCopy.submit}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}