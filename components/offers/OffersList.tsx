'use client';

import { useState } from 'react';
import { WagonType, CargoType, Offer } from '@prisma/client';
import { copy } from '@/lib/i18n/ru';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { archiveOffer, activateOffer } from '@/lib/actions/offers';

interface OffersListProps {
  offers: (Offer & {
    company: { name: string };
    createdBy: { name: string; email: string };
  })[];
  filters: {
    status: 'active' | 'archived' | 'all';
    wagonType?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  loading?: boolean;
  error?: string | null;
}

export function OffersList({ offers, filters, loading, error }: OffersListProps) {
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const wagonTypeLabels: Record<WagonType, string> = {
    [WagonType.TANK]: 'Цистерна',
    [WagonType.HOPPER]: 'Хоппер',
    [WagonType.FLATCAR]: 'Платформа',
    [WagonType.BOXCAR]: 'Крытый вагон',
    [WagonType.GONDOLA]: 'Полувагон',
    [WagonType.REFRIGERATOR]: 'Рефрижератор',
    [WagonType.PLATFORM]: 'Платформа',
  };

  const cargoTypeLabels: Record<CargoType, string> = {
    [CargoType.COAL]: 'Уголь',
    [CargoType.OIL]: 'Нефтепродукты',
    [CargoType.GRAIN]: 'Зерно',
    [CargoType.METAL]: 'Металл',
    [CargoType.CHEMICAL]: 'Химикаты',
    [CargoType.TIMBER]: 'Лес',
    [CargoType.CONTAINER]: 'Контейнеры',
    [CargoType.BULK]: 'Сыпучие грузы',
    [CargoType.OTHER]: 'Другое',
  };

  const handleArchive = async (id: number) => {
    setIsUpdating(id);
    try {
      const result = await archiveOffer(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to archive offer:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleActivate = async (id: number) => {
    setIsUpdating(id);
    try {
      const result = await activateOffer(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to activate offer:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-neutral-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          {copy.operator.offers.empty.title}
        </h3>
        <p className="text-neutral-600 mb-6">
          {copy.operator.offers.empty.description}
        </p>
        <a
          href="/operator/offers/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          {copy.operator.offers.empty.cta}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">
            {copy.common.filter}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {copy.operator.offers.filters.status}
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{copy.common.all}</option>
                <option value="active">{copy.common.active}</option>
                <option value="archived">{copy.common.archived}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {copy.operator.offers.filters.wagonType}
              </label>
              <select
                value={filters.wagonType || ''}
                onChange={(e) => updateFilter('wagonType', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{copy.common.all}</option>
                {Object.values(WagonType).map((type) => (
                  <option key={type} value={type}>
                    {wagonTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {copy.operator.offers.filters.dateRange}
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = '/operator/offers';
                }}
              >
                {copy.operator.offers.filters.clear}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Offers List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer.id}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {wagonTypeLabels[offer.wagonType]}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                      {cargoTypeLabels[offer.cargoType]}
                    </span>
                    {offer.isArchived && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                        {copy.common.archived}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    {offer.departureStation} → {offer.arrivalStation}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-600">
                    <div>
                      <span className="font-medium">Количество:</span> {offer.wagonCount} вагонов
                    </div>
                    <div>
                      <span className="font-medium">Цена:</span> {offer.pricePerWagon.toLocaleString('ru-RU')} ₽/вагон
                    </div>
                    <div>
                      <span className="font-medium">Доступно:</span> {new Date(offer.availableFrom).toLocaleDateString('ru-RU')} - {new Date(offer.availableUntil).toLocaleDateString('ru-RU')}
                    </div>
                    <div>
                      <span className="font-medium">Маршрут:</span> {offer.departureRegion} → {offer.arrivalRegion}
                    </div>
                  </div>
                  
                  {offer.description && (
                    <p className="mt-3 text-sm text-neutral-600">{offer.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={`/operator/offers/${offer.id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                  >
                    {copy.common.edit}
                  </a>
                  {offer.isArchived ? (
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isUpdating === offer.id}
                      onClick={() => handleActivate(offer.id)}
                    >
                      {copy.operator.offers.table.actions.activate}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isUpdating === offer.id}
                      onClick={() => handleArchive(offer.id)}
                    >
                      {copy.common.archive}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}