import { z } from 'zod';
import { WagonType, CargoType } from '@prisma/client';

export const offerFormSchema = z.object({
  wagonType: z.nativeEnum(WagonType),
  cargoType: z.nativeEnum(CargoType),
  wagonCount: z.number().min(1, 'Количество вагонов должно быть больше 0'),
  departureStation: z.string().min(1, 'Укажите станцию отправления'),
  departureRegion: z.string().min(1, 'Укажите регион отправления'),
  arrivalStation: z.string().min(1, 'Укажите станцию назначения'),
  arrivalRegion: z.string().min(1, 'Укажите регион назначения'),
  availableFrom: z.string().min(1, 'Укажите дату начала'),
  availableUntil: z.string().min(1, 'Укажите дату окончания'),
  pricePerWagon: z.number().min(0, 'Цена должна быть не отрицательной'),
  description: z.string().optional(),
}).refine(
  (data) => {
    const from = new Date(data.availableFrom);
    const to = new Date(data.availableUntil);
    return to > from;
  },
  {
    message: 'Дата окончания должна быть позже даты начала',
    path: ['availableUntil'],
  }
);

export type OfferFormData = z.infer<typeof offerFormSchema>;