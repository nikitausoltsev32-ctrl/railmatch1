import { Offer, Company } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { copy } from '@/lib/i18n/ru';

interface OfferCardProps {
  offer: Offer & { company: Company };
}

const WAGON_TYPE_LABELS: Record<string, string> = {
  TANK: 'Цистерна',
  HOPPER: 'Думпкар',
  FLATCAR: 'Платформа',
  BOXCAR: 'Крытый вагон',
  GONDOLA: 'Гондола',
  REFRIGERATOR: 'Рефрижератор',
  PLATFORM: 'Платформа',
};

const CARGO_TYPE_LABELS: Record<string, string> = {
  COAL: 'Уголь',
  OIL: 'Нефть',
  GRAIN: 'Зерно',
  METAL: 'Металл',
  CHEMICAL: 'Химия',
  TIMBER: 'Лес',
  CONTAINER: 'Контейнеры',
  BULK: 'Насыпь',
  OTHER: 'Прочее',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateRange(from: Date, to: Date): string {
  return `${formatDate(from)} – ${formatDate(to)}`;
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-neutral-200">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {copy.seeker.browse.offerCard.route}
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            {offer.departureStation} → {offer.arrivalStation}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-neutral-500">
            {copy.seeker.browse.offerCard.company}
          </p>
          <p className="text-sm font-semibold text-neutral-900">
            {offer.company.name}
          </p>
        </div>
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-neutral-200">
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase">
            {copy.seeker.browse.offerCard.wagonType}
          </p>
          <p className="text-sm font-semibold text-neutral-900 mt-1">
            {WAGON_TYPE_LABELS[offer.wagonType] || offer.wagonType}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase">
            {copy.seeker.browse.offerCard.cargoType}
          </p>
          <p className="text-sm font-semibold text-neutral-900 mt-1">
            {CARGO_TYPE_LABELS[offer.cargoType] || offer.cargoType}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase">
            {copy.seeker.browse.offerCard.wagons}
          </p>
          <p className="text-sm font-semibold text-neutral-900 mt-1">
            {offer.wagonCount}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase">
            {copy.seeker.browse.offerCard.price}
          </p>
          <p className="text-sm font-semibold text-primary-600 mt-1">
            ₽{offer.pricePerWagon.toLocaleString('ru-RU')}
          </p>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-4 pb-4 border-b border-neutral-200">
        <p className="text-xs font-medium text-neutral-500 uppercase mb-1">
          {copy.seeker.browse.offerCard.available}
        </p>
        <p className="text-sm text-neutral-700">
          {formatDateRange(offer.availableFrom, offer.availableUntil)}
        </p>
      </div>

      {/* Description */}
      {offer.description && (
        <div className="mb-4 pb-4 border-b border-neutral-200">
          <p className="text-sm text-neutral-600 line-clamp-2">
            {offer.description}
          </p>
        </div>
      )}

      {/* Regions */}
      <div className="mb-6 pb-4 border-b border-neutral-200">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-neutral-500 mb-1">От</p>
            <p className="font-medium text-neutral-900">{offer.departureRegion}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">До</p>
            <p className="font-medium text-neutral-900">{offer.arrivalRegion}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
        >
          {copy.seeker.browse.offerCard.viewDetails}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
        >
          {copy.seeker.browse.offerCard.contact}
        </Button>
      </div>
    </Card>
  );
}
