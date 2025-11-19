import { Metadata } from 'next';
import { copy } from '@/lib/i18n/ru';
import { OffersList } from '@/components/offers/OffersList';
import { getOffers } from '@/lib/actions/offers';

export const metadata: Metadata = {
  title: `${copy.operator.offers.title} - RailMatch`,
  description: 'Управление предложениями вагонов',
};

export default async function OffersPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    wagonType?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}) {
  const filters = {
    status: (searchParams?.status as 'active' | 'archived' | 'all') || 'active',
    wagonType: searchParams?.wagonType,
    dateFrom: searchParams?.dateFrom,
    dateTo: searchParams?.dateTo,
  };

  const result = await getOffers(filters);

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          {copy.operator.offers.title}
        </h1>
        <a
          href="/operator/offers/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          {copy.operator.offers.create}
        </a>
      </div>

      <OffersList
        offers={result.success ? result.data || [] : []}
        filters={filters}
        loading={false}
        error={result.success ? null : result.error}
      />
    </div>
  );
}