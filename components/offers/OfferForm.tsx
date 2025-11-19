'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { offerFormSchema, OfferFormData } from '@/lib/schemas/offer';
import { WagonType, CargoType } from '@prisma/client';
import { copy } from '@/lib/i18n/ru';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

interface OfferFormProps {
  initialData?: Partial<OfferFormData>;
  onSubmit: (data: OfferFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function OfferForm({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: OfferFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: initialData,
  });

  const wagonTypes = Object.values(WagonType);
  const cargoTypes = Object.values(CargoType);

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

  const onFormSubmit = async (data: OfferFormData) => {
    try {
      setError(null);
      await onSubmit(data);
    } catch (err) {
      setError('Произошла ошибка при сохранении предложения');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Select
            label={copy.operator.offers.form.wagonType}
            options={wagonTypes.map((type) => ({
              value: type,
              label: wagonTypeLabels[type],
            }))}
            {...register('wagonType')}
            error={errors.wagonType?.message}
          />
        </div>

        <div>
          <Select
            label={copy.operator.offers.form.cargoType}
            options={cargoTypes.map((type) => ({
              value: type,
              label: cargoTypeLabels[type],
            }))}
            {...register('cargoType')}
            error={errors.cargoType?.message}
          />
        </div>
      </div>

      <div>
        <Input
          label={copy.operator.offers.form.wagonCount}
          type="number"
          min={1}
          {...register('wagonCount', { valueAsNumber: true })}
          error={errors.wagonCount?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Input
            label={copy.operator.offers.form.departureStation}
            {...register('departureStation')}
            error={errors.departureStation?.message}
          />
        </div>

        <div>
          <Input
            label={copy.operator.offers.form.departureRegion}
            {...register('departureRegion')}
            error={errors.departureRegion?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Input
            label={copy.operator.offers.form.arrivalStation}
            {...register('arrivalStation')}
            error={errors.arrivalStation?.message}
          />
        </div>

        <div>
          <Input
            label={copy.operator.offers.form.arrivalRegion}
            {...register('arrivalRegion')}
            error={errors.arrivalRegion?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Input
            label={copy.operator.offers.form.availableFrom}
            type="date"
            {...register('availableFrom')}
            error={errors.availableFrom?.message}
          />
        </div>

        <div>
          <Input
            label={copy.operator.offers.form.availableUntil}
            type="date"
            {...register('availableUntil')}
            error={errors.availableUntil?.message}
          />
        </div>
      </div>

      <div>
        <Input
          label={copy.operator.offers.form.pricePerWagon}
          type="number"
          min={0}
          step={0.01}
          {...register('pricePerWagon', { valueAsNumber: true })}
          error={errors.pricePerWagon?.message}
        />
      </div>

      <div>
        <Textarea
          label={copy.operator.offers.form.description}
          rows={4}
          {...register('description')}
          error={errors.description?.message}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          {copy.operator.offers.form.cancel}
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? copy.operator.offers.form.update : copy.operator.offers.form.submit}
        </Button>
      </div>
    </form>
  );
}