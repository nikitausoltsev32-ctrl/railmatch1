'use client';

import { useState } from 'react';
import { copy } from '@/lib/i18n/ru';
import { DealStatus, Match } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

interface ProposeConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: MatchWithStatus;
  companyType: 'operator' | 'seeker';
  onSubmit: (price: number, comment: string) => Promise<void>;
}

export function ProposeConditionsModal({
  isOpen,
  onClose,
  response,
  companyType,
  onSubmit,
}: ProposeConditionsModalProps) {
  const [price, setPrice] = useState(response.offer.pricePerWagon.toString());
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalCopy = companyType === 'operator' 
    ? copy.operator.responses.modals.proposeConditions 
    : copy.seeker.inbox.modals.proposeConditions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!price || parseFloat(price) <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(parseFloat(price), comment);
      onClose();
      // Reset form
      setPrice(response.offer.pricePerWagon.toString());
      setComment('');
    } catch (error) {
      console.error('Error proposing conditions:', error);
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
            <Input
              label={modalCopy.priceField}
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <Textarea
              label={modalCopy.commentField}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Добавьте комментарий к вашему предложению..."
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
              {isSubmitting ? 'Отправка...' : modalCopy.submit}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}