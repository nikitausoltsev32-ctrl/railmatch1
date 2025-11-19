import { Suspense } from 'react';
import { BrowseContent } from '@/components/catalog/BrowseContent';
import { OfferCardSkeleton } from '@/components/catalog/OfferCardSkeleton';

interface BrowsePageProps {
  searchParams?: {
    page?: string;
    sort?: string;
    wagonType?: string;
    cargoType?: string;
    departureRegion?: string;
    arrivalRegion?: string;
    dateFrom?: string;
    dateTo?: string;
    priceMin?: string;
    priceMax?: string;
  };
}

export const metadata = {
  title: 'Каталог предложений | RailMatch',
  description: 'Найдите подходящие предложения вагонов для вашего груза',
};

export default function BrowsePage({ searchParams }: BrowsePageProps) {
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const sort = searchParams?.sort || 'relevance';

  const initialFilters = {
    wagonType: searchParams?.wagonType,
    cargoType: searchParams?.cargoType,
    departureRegion: searchParams?.departureRegion,
    arrivalRegion: searchParams?.arrivalRegion,
    dateFrom: searchParams?.dateFrom,
    dateTo: searchParams?.dateTo,
    priceMin: searchParams?.priceMin ? parseInt(searchParams.priceMin) : undefined,
    priceMax: searchParams?.priceMax ? parseInt(searchParams.priceMax) : undefined,
  };

  return (
    <div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <OfferCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <BrowseContent
          initialPage={page}
          initialSort={sort}
          initialFilters={initialFilters}
        />
      </Suspense>
    </div>
  );
}
