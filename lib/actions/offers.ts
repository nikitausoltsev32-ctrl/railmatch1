'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { offerFormSchema } from '@/lib/schemas/offer';

const prisma = new PrismaClient();

export async function createOffer(data: z.infer<typeof offerFormSchema>) {
  try {
    // TODO: Get authenticated user and company from session
    // For now, using hardcoded values from seed data
    const userId = 2; // Operator user from seed
    const companyId = 1; // First company from seed

    const offer = await prisma.offer.create({
      data: {
        ...data,
        availableFrom: new Date(data.availableFrom),
        availableUntil: new Date(data.availableUntil),
        companyId,
        createdById: userId,
      },
    });

    revalidatePath('/operator/offers');
    return { success: true, data: offer };
  } catch (error) {
    console.error('Error creating offer:', error);
    return { success: false, error: 'Failed to create offer' };
  }
}

export async function updateOffer(id: number, data: z.infer<typeof offerFormSchema>) {
  try {
    // TODO: Add authorization check
    const offer = await prisma.offer.update({
      where: { id },
      data: {
        ...data,
        availableFrom: new Date(data.availableFrom),
        availableUntil: new Date(data.availableUntil),
      },
    });

    revalidatePath('/operator/offers');
    revalidatePath(`/operator/offers/${id}/edit`);
    return { success: true, data: offer };
  } catch (error) {
    console.error('Error updating offer:', error);
    return { success: false, error: 'Failed to update offer' };
  }
}

export async function archiveOffer(id: number) {
  try {
    // TODO: Add authorization check
    await prisma.offer.update({
      where: { id },
      data: { isArchived: true },
    });

    revalidatePath('/operator/offers');
    return { success: true };
  } catch (error) {
    console.error('Error archiving offer:', error);
    return { success: false, error: 'Failed to archive offer' };
  }
}

export async function activateOffer(id: number) {
  try {
    // TODO: Add authorization check
    await prisma.offer.update({
      where: { id },
      data: { isArchived: false },
    });

    revalidatePath('/operator/offers');
    return { success: true };
  } catch (error) {
    console.error('Error activating offer:', error);
    return { success: false, error: 'Failed to activate offer' };
  }
}

export async function getOffers(filters?: {
  status?: 'active' | 'archived' | 'all';
  wagonType?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    const where: any = {};

    if (filters?.status === 'active') {
      where.isArchived = false;
    } else if (filters?.status === 'archived') {
      where.isArchived = true;
    }

    if (filters?.wagonType) {
      where.wagonType = filters.wagonType;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.availableFrom = {};
      if (filters.dateFrom) {
        where.availableFrom.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.availableFrom.lte = new Date(filters.dateTo);
      }
    }

    // TODO: Add company filter based on authenticated user
    const offers = await prisma.offer.findMany({
      where,
      include: {
        company: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: offers };
  } catch (error) {
    console.error('Error fetching offers:', error);
    return { success: false, error: 'Failed to fetch offers' };
  }
}

export async function getOffer(id: number) {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        company: true,
        createdBy: true,
      },
    });

    if (!offer) {
      return { success: false, error: 'Offer not found' };
    }

    return { success: true, data: offer };
  } catch (error) {
    console.error('Error fetching offer:', error);
    return { success: false, error: 'Failed to fetch offer' };
  }
}