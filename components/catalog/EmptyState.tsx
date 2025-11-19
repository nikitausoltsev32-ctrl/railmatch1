import { Button } from '@/components/ui/Button';
import { copy } from '@/lib/i18n/ru';

interface EmptyStateProps {
  onResetFilters: () => void;
}

export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {copy.seeker.browse.empty.title}
      </h3>
      <p className="text-sm text-neutral-600 mb-6 max-w-sm">
        {copy.seeker.browse.empty.description}
      </p>
      <Button
        variant="primary"
        size="sm"
        onClick={onResetFilters}
      >
        {copy.seeker.browse.empty.resetButton}
      </Button>
    </div>
  );
}
