'use client';

import { useState, useCallback, useEffect } from 'react';
import { WagonType, CargoType } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { copy } from '@/lib/i18n/ru';

interface CatalogFiltersProps {
  onFiltersChange: (filters: CatalogFilterValues) => void;
}

export interface CatalogFilterValues {
  wagonType?: string;
  cargoType?: string;
  departureRegion?: string;
  arrivalRegion?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
}

const WAGON_TYPES = [
  { value: 'TANK', label: 'Цистерна' },
  { value: 'HOPPER', label: 'Думпкар' },
  { value: 'FLATCAR', label: 'Платформа' },
  { value: 'BOXCAR', label: 'Крытый вагон' },
  { value: 'GONDOLA', label: 'Гондола' },
  { value: 'REFRIGERATOR', label: 'Рефрижератор' },
  { value: 'PLATFORM', label: 'Платформа' },
];

const CARGO_TYPES = [
  { value: 'COAL', label: 'Уголь' },
  { value: 'OIL', label: 'Нефть' },
  { value: 'GRAIN', label: 'Зерно' },
  { value: 'METAL', label: 'Металл' },
  { value: 'CHEMICAL', label: 'Химия' },
  { value: 'TIMBER', label: 'Лес' },
  { value: 'CONTAINER', label: 'Контейнеры' },
  { value: 'BULK', label: 'Насыпь' },
  { value: 'OTHER', label: 'Прочее' },
];

export function CatalogFilters({ onFiltersChange }: CatalogFiltersProps) {
  const [filters, setFilters] = useState<CatalogFilterValues>({});

  // Load filters from sessionStorage on mount
  useEffect(() => {
    const storedFilters = sessionStorage.getItem('catalogFilters');
    if (storedFilters) {
      try {
        const parsed = JSON.parse(storedFilters);
        setFilters(parsed);
        onFiltersChange(parsed);
      } catch (e) {
        console.error('Failed to parse stored filters:', e);
      }
    }
  }, [onFiltersChange]);

  const handleFilterChange = useCallback(
    (newFilters: CatalogFilterValues) => {
      setFilters(newFilters);
      sessionStorage.setItem('catalogFilters', JSON.stringify(newFilters));
      onFiltersChange(newFilters);
    },
    [onFiltersChange]
  );

  const handleResetFilters = () => {
    const emptyFilters: CatalogFilterValues = {};
    setFilters(emptyFilters);
    sessionStorage.removeItem('catalogFilters');
    onFiltersChange(emptyFilters);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        {copy.seeker.browse.filters.resetFilters}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Wagon Type Filter */}
        <Select
          label={copy.seeker.browse.filters.wagonType}
          value={filters.wagonType || ''}
          onChange={(value: any) =>
            handleFilterChange({
              ...filters,
              wagonType: value || undefined,
            })
          }
          options={[
            { value: '', label: 'Все типы вагонов' },
            ...WAGON_TYPES,
          ]}
        />

        {/* Cargo Type Filter */}
        <Select
          label={copy.seeker.browse.filters.cargoType}
          value={filters.cargoType || ''}
          onChange={(value: any) =>
            handleFilterChange({
              ...filters,
              cargoType: value || undefined,
            })
          }
          options={[
            { value: '', label: 'Все типы груза' },
            ...CARGO_TYPES,
          ]}
        />

        {/* Departure Region Filter */}
        <Input
          label={copy.seeker.browse.filters.departureRegion}
          type="text"
          placeholder="Москва, Санкт-Петербург..."
          value={filters.departureRegion || ''}
          onChange={(e) =>
            handleFilterChange({
              ...filters,
              departureRegion: e.target.value || undefined,
            })
          }
        />

        {/* Arrival Region Filter */}
        <Input
          label={copy.seeker.browse.filters.arrivalRegion}
          type="text"
          placeholder="Москва, Санкт-Петербург..."
          value={filters.arrivalRegion || ''}
          onChange={(e) =>
            handleFilterChange({
              ...filters,
              arrivalRegion: e.target.value || undefined,
            })
          }
        />

        {/* Date Range Filters */}
        <Input
          label={`${copy.seeker.browse.filters.dateRange} - От`}
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) =>
            handleFilterChange({
              ...filters,
              dateFrom: e.target.value || undefined,
            })
          }
        />

        <Input
          label={`${copy.seeker.browse.filters.dateRange} - До`}
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) =>
            handleFilterChange({
              ...filters,
              dateTo: e.target.value || undefined,
            })
          }
        />

        {/* Price Range Filters */}
        <Input
          label={`${copy.seeker.browse.filters.priceRange} - От`}
          type="number"
          placeholder="Мин. цена"
          value={filters.priceMin || ''}
          onChange={(e) =>
            handleFilterChange({
              ...filters,
              priceMin: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
        />

        <Input
          label={`${copy.seeker.browse.filters.priceRange} - До`}
          type="number"
          placeholder="Макс. цена"
          value={filters.priceMax || ''}
          onChange={(e) =>
            handleFilterChange({
              ...filters,
              priceMax: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
        />
      </div>

      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
        >
          {copy.seeker.browse.filters.resetFilters}
        </Button>
      </div>
    </div>
  );
}
