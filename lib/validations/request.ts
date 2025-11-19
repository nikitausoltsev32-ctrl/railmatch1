import { z } from 'zod';

export const requestFormSchema = z.object({
  cargoType: z.enum(['COAL', 'OIL', 'GRAIN', 'METAL', 'CHEMICAL', 'TIMBER', 'CONTAINER', 'BULK', 'OTHER']),
  wagonType: z.enum(['TANK', 'HOPPER', 'FLATCAR', 'BOXCAR', 'GONDOLA', 'REFRIGERATOR', 'PLATFORM']).optional(),
  cargoWeight: z.number().min(0.1, 'Вес должен быть больше 0').max(10000, 'Вес не может превышать 10000 тонн'),
  departureStation: z.string().min(1, 'Название станции обязательно').max(100, 'Слишком длинное название'),
  departureRegion: z.string().min(1, 'Название региона обязательно').max(100, 'Слишком длинное название'),
  arrivalStation: z.string().min(1, 'Название станции обязательно').max(100, 'Слишком длинное название'),
  arrivalRegion: z.string().min(1, 'Название региона обязательно').max(100, 'Слишком длинное название'),
  loadingDate: z.string().min(1, 'Выберите дату погрузки'),
  requiredByDate: z.string().min(1, 'Выберите требуемую дату доставки'),
  maxPricePerWagon: z.number().min(0, 'Цена не может быть отрицательной').optional(),
  description: z.string().max(1000, 'Описание не должно превышать 1000 символов').optional(),
}).refine((data) => {
  const loadingDate = new Date(data.loadingDate);
  const requiredByDate = new Date(data.requiredByDate);
  return requiredByDate > loadingDate;
}, {
  message: 'Дата доставки должна быть позже даты погрузки',
  path: ['requiredByDate'],
});

export type RequestFormData = z.infer<typeof requestFormSchema>;