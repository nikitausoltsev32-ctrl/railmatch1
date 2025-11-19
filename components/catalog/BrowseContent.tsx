'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCatalogOffers } from '@/lib/actions/offers';
import { CatalogFilters, CatalogFilterValues } from './CatalogFilters';
import { CatalogSorting } from './CatalogSorting';
import { OfferCard } from './OfferCard';
import { CatalogPagination } from './CatalogPagination';
import { EmptyState } from './EmptyState';
import { OfferCardSkeleton } from './OfferCardSkeleton';
import { copy } from '@/lib/i18n/ru';

interface BrowseContentProps {
  initialPage: number;
  initialSort: string;
  initialFilters: CatalogFilterValues;
}

export function BrowseContent({
  initialPage,
  initialSort,
  initialFilters,
}: BrowseContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [offers, setOffers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState(initialSort || 'relevance');
  const [filters, setFilters] = useState<CatalogFilterValues>(initialFilters);
  const [page, setPage] = useState(initialPage);

  // Update URL params when filters, sort, or page changes
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', page.toString());
    if (sort && sort !== 'relevance') params.set('sort', sort);

    if (filters.wagonType) params.set('wagonType', filters.wagonType);
    if (filters.cargoType) params.set('cargoType', filters.cargoType);
    if (filters.departureRegion) params.set('departureRegion', filters.departureRegion);
    if (filters.arrivalRegion) params.set('arrivalRegion', filters.arrivalRegion);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.priceMin) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());

    const queryString = params.toString();
    router.push(`/seeker/browse${queryString ? `?${queryString}` : ''}`);
  }, [page, sort, filters, router]);

  // Fetch offers when filters, sort, or page changes
  const fetchOffers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCatalogOffers({
        page,
        sort: sort as any,
        ...filters,
        priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
        priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
      });

      if (response.success && response.data) {
        setOffers(response.data.offers);
        setPagination(response.data.pagination);
        updateUrlParams();
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, sort, filters, updateUrlParams]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleFiltersChange = (newFilters: CatalogFilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFilters({});
    setSort('relevance');
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {copy.seeker.browse.title}
        </h1>
        <p className="text-neutral-600">
          {copy.seeker.browse.subtitle}
        </p>
      </div>

      {/* Filters */}
      <CatalogFilters onFiltersChange={handleFiltersChange} />

      {/* Sorting and Results Info */}
      <div className="flex justify-between items-center mb-6">
        <CatalogSorting value={sort} onChange={handleSortChange} />
        {pagination && (
          <p className="text-sm text-neutral-600">
            Найдено: {pagination.total} {pagination.total === 1 ? 'предложение' : 'предложений'}
          </p>
        )}
      </div>

      {/* Offers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <OfferCardSkeleton key={i} />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState onResetFilters={handleResetFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <CatalogPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
