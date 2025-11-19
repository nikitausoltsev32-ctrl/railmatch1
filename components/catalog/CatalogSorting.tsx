'use client';

import { Select } from '@/components/ui/Select';
import { copy } from '@/lib/i18n/ru';

interface CatalogSortingProps {
  value: string;
  onChange: (value: string) => void;
}

const SORT_OPTIONS = [
  { value: 'relevance', label: copy.seeker.browse.sorting.relevance },
  { value: 'priceAsc', label: copy.seeker.browse.sorting.priceAsc },
  { value: 'priceDesc', label: copy.seeker.browse.sorting.priceDesc },
  { value: 'newest', label: copy.seeker.browse.sorting.newestAvailability },
];

export function CatalogSorting({ value, onChange }: CatalogSortingProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-neutral-700">
        Сортировка:
      </label>
      <div className="w-48">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
