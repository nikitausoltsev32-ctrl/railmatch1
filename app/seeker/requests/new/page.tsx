'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { createRequest } from '@/lib/actions/requests';
import { requestFormSchema, RequestFormData } from '@/lib/validations/request';
import { copy } from '@/lib/i18n/ru';

const cargoTypeOptions = [
  { value: 'COAL', label: 'Уголь' },
  { value: 'OIL', label: 'Нефть и нефтепродукты' },
  { value: 'GRAIN', label: 'Зерно' },
  { value: 'METAL', label: 'Металлы' },
  { value: 'CHEMICAL', label: 'Химикаты' },
  { value: 'TIMBER', label: 'Лесоматериалы' },
  { value: 'CONTAINER', label: 'Контейнеры' },
  { value: 'BULK', label: 'Навалочные грузы' },
  { value: 'OTHER', label: 'Другое' },
];

const wagonTypeOptions = [
  { value: 'TANK', label: 'Цистерна' },
  { value: 'HOPPER', label: 'Хоппер' },
  { value: 'FLATCAR', label: 'Платформа' },
  { value: 'BOXCAR', label: 'Крытый вагон' },
  { value: 'GONDOLA', label: 'Полувагон' },
  { value: 'REFRIGERATOR', label: 'Рефрижератор' },
  { value: 'PLATFORM', label: 'Платформа' },
];

export default function NewRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createRequest(data);
      
      if (result.success) {
        router.push('/seeker/requests');
      } else {
        setError(result.error || 'Произошла ошибка');
      }
    } catch (err) {
      setError('Произошла непредвиденная ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {copy.seeker.requests.newTitle}
        </h1>
        <p className="text-neutral-600">
          Заполните форму для создания новой заявки на перевозку
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={copy.seeker.requests.form.cargoType}
            options={cargoTypeOptions}
            value={watch('cargoType')}
            onChange={(value: any) => setValue('cargoType', value as any)}
            error={errors.cargoType?.message}
            required
          />

          <Select
            label={copy.seeker.requests.form.wagonType}
            options={wagonTypeOptions}
            value={watch('wagonType') || ''}
            onChange={(value: any) => setValue('wagonType', (value || undefined) as any)}
            error={errors.wagonType?.message}
            placeholder="Не указано"
          />

          <Input
            label={copy.seeker.requests.form.cargoWeight}
            type="number"
            step="0.1"
            min="0.1"
            max="10000"
            {...register('cargoWeight', { valueAsNumber: true })}
            error={errors.cargoWeight?.message}
            required
          />

          <Input
            label={copy.seeker.requests.form.maxPricePerWagon}
            type="number"
            step="0.01"
            min="0"
            {...register('maxPricePerWagon', { valueAsNumber: true })}
            error={errors.maxPricePerWagon?.message}
            placeholder="Не указано"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={copy.seeker.requests.form.departureStation}
            {...register('departureStation')}
            error={errors.departureStation?.message}
            required
          />

          <Input
            label={copy.seeker.requests.form.departureRegion}
            {...register('departureRegion')}
            error={errors.departureRegion?.message}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={copy.seeker.requests.form.arrivalStation}
            {...register('arrivalStation')}
            error={errors.arrivalStation?.message}
            required
          />

          <Input
            label={copy.seeker.requests.form.arrivalRegion}
            {...register('arrivalRegion')}
            error={errors.arrivalRegion?.message}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={copy.seeker.requests.form.loadingDate}
            type="date"
            min={today}
            {...register('loadingDate')}
            error={errors.loadingDate?.message}
            required
          />

          <Input
            label={copy.seeker.requests.form.requiredByDate}
            type="date"
            min={today}
            {...register('requiredByDate')}
            error={errors.requiredByDate?.message}
            required
          />
        </div>

        <Textarea
          label={copy.seeker.requests.form.description}
          {...register('description')}
          error={errors.description?.message}
          rows={4}
          placeholder="Дополнительная информация о заявке..."
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? copy.common.loading : copy.seeker.requests.form.submit}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {copy.seeker.requests.form.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}