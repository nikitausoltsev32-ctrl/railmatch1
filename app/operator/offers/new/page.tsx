import { Metadata } from 'next';
import { copy } from '@/lib/i18n/ru';
import { OfferForm } from '@/components/offers/OfferForm';
import { createOffer } from '@/lib/actions/offers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: `${copy.operator.offers.create} - RailMatch`,
  description: 'Создание нового предложения вагонов',
};

export default function NewOfferPage() {
  const handleSubmit = async (data: any) => {
    'use server';
    const result = await createOffer(data);
    if (result.success) {
      redirect('/operator/offers');
    } else {
      throw new Error(result.error || 'Failed to create offer');
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-neutral-900 mb-8">
          {copy.operator.offers.form.title}
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <OfferForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}