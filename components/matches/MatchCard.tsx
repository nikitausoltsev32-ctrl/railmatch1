'use client';

/**
 * Match Card Component
 * Displays a single matched offer with score and actions
 */

import { useState } from 'react';
import { ScoringReason } from '@/lib/matching';
import { ScoreGauge } from './ScoreGauge';
import { ScoreFactors } from './ScoreFactors';
import { copy } from '@/lib/i18n/ru';
import { Button } from '@/components/ui/Button';

interface OfferInfo {
  id: number;
  wagonType: string;
  cargoType: string;
  wagonCount: number;
  departureStation: string;
  departureRegion: string;
  arrivalStation: string;
  arrivalRegion: string;
  availableFrom: string | Date;
  availableUntil: string | Date;
  pricePerWagon: number;
  description?: string | null;
}

interface CompanyInfo {
  id: number;
  name: string;
  description?: string | null;
}

interface MatchCardProps {
  offerId: number;
  score: number;
  offer: OfferInfo;
  company: CompanyInfo;
  reasons: ScoringReason[];
  onContact?: (offerId: number) => void;
  onRespond?: (offerId: number) => void;
  onSave?: (offerId: number) => void;
}

export function MatchCard({
  offerId,
  score,
  offer,
  company,
  reasons,
  onContact,
  onRespond,
  onSave,
}: MatchCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const matchesCopy = copy.seeker.matches;
  const offerDetailsCopy = matchesCopy.details;

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU');
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(offerId);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with score */}
      <div className="p-6 border-b border-neutral-200 bg-neutral-50 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
              {offer.cargoType}
            </span>
            <span className="inline-block px-2 py-1 bg-neutral-200 text-neutral-700 text-xs font-medium rounded">
              {offer.wagonType}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">{company.name}</h3>
          <p className="text-sm text-neutral-600 mt-1">{company.description}</p>
        </div>
        <div className="flex-shrink-0">
          <ScoreGauge score={score} size="md" />
        </div>
      </div>

      {/* Details grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-neutral-200">
        <div>
          <label className="text-xs font-semibold text-neutral-600 uppercase">{offerDetailsCopy.wagon}</label>
          <p className="text-sm text-neutral-900 mt-1">{offer.wagonType}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-600 uppercase">{offerDetailsCopy.count}</label>
          <p className="text-sm text-neutral-900 mt-1">{offer.wagonCount} шт.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-600 uppercase">{offerDetailsCopy.route}</label>
          <p className="text-sm text-neutral-900 mt-1">
            {offer.departureRegion} → {offer.arrivalRegion}
          </p>
          <p className="text-xs text-neutral-600">
            {offer.departureStation} → {offer.arrivalStation}
          </p>
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-600 uppercase">{offerDetailsCopy.availability}</label>
          <p className="text-sm text-neutral-900 mt-1">
            {formatDate(offer.availableFrom)} — {formatDate(offer.availableUntil)}
          </p>
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-600 uppercase">{offerDetailsCopy.price}</label>
          <p className="text-sm font-semibold text-primary-600 mt-1">
            {new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
              maximumFractionDigits: 0,
            }).format(offer.pricePerWagon)}
          </p>
        </div>
        {offer.description && (
          <div>
            <label className="text-xs font-semibold text-neutral-600 uppercase">{offerDetailsCopy.description}</label>
            <p className="text-sm text-neutral-600 mt-1">{offer.description}</p>
          </div>
        )}
      </div>

      {/* Score factors */}
      <div className="p-6 border-b border-neutral-200">
        <ScoreFactors reasons={reasons} />
      </div>

      {/* Actions */}
      <div className="p-6 bg-neutral-50 flex gap-3 flex-wrap">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onContact?.(offerId)}
          className="flex-1 min-w-[120px]"
        >
          {matchesCopy.actions.contact}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRespond?.(offerId)}
          className="flex-1 min-w-[120px]"
        >
          {matchesCopy.actions.respond}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className={`flex-1 min-w-[120px] ${isSaved ? 'bg-primary-50 text-primary-600' : ''}`}
        >
          {isSaved ? '✓ ' : ''}
          {matchesCopy.actions.save}
        </Button>
      </div>
    </div>
  );
}
