'use client';

import { Button } from '@/components/ui/Button';

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
}

export function CatalogPagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
}: CatalogPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-neutral-200">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
      >
        Назад
      </Button>

      <div className="flex items-center gap-2">
        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                pageNum === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        {totalPages > 5 && <span className="text-neutral-500">...</span>}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
      >
        Далее
      </Button>

      <span className="text-sm text-neutral-600 ml-4">
        Страница {currentPage} из {totalPages}
      </span>
    </div>
  );
}
