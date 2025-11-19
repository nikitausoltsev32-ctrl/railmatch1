import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { copy } from '@/lib/i18n/ru';
import { OfferForm } from '@/components/offers/OfferForm';
import { getOffer, updateOffer } from '@/lib/actions/offers';
import { redirect } from 'next/navigation';

interface EditOfferPageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: `${copy.operator.offers.edit} - RailMatch`,
  description: 'Редактирование предложения вагонов',
};

export default async function EditOfferPage({ params }: EditOfferPageProps) {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    notFound();
  }

  const result = await getOffer(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  const offer = result.data;

  const handleSubmit = async (data: any) => {
    'use server';
    const result = await updateOffer(id, data);
    if (result.success) {
      redirect('/operator/offers');
    } else {
      throw new Error(result.error || 'Failed to update offer');
    }
  };

  // Prepare initial data for the form
  const initialData = {
    wagonType: offer.wagonType,
    cargoType: offer.cargoType,
    wagonCount: offer.wagonCount,
    departureStation: offer.departureStation,
    departureRegion: offer.departureRegion,
    arrivalStation: offer.arrivalStation,
    arrivalRegion: offer.arrivalRegion,
    availableFrom: offer.availableFrom.toISOString().split('T')[0],
    availableUntil: offer.availableUntil.toISOString().split('T')[0],
    pricePerWagon: offer.pricePerWagon,
    description: offer.description || '',
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-neutral-900 mb-8">
          {copy.operator.offers.form.editTitle}
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <OfferForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isEdit={true}
          />
        </div>
      </div>
    </div>
  );
}