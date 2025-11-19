'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requestFormSchema } from '@/lib/validations/request';
import { DealStatus } from '@prisma/client';

// Mock user session - in real app, get from auth
const mockUser = {
  id: 3, // Assuming user ID 3 is a seeker
  companyId: 2, // Assuming company ID 2 is a seeker company
};

export async function createRequest(data: z.infer<typeof requestFormSchema>) {
  try {
    const validatedData = requestFormSchema.parse(data);
    
    const request = await prisma.request.create({
      data: {
        ...validatedData,
        companyId: mockUser.companyId,
        createdById: mockUser.id,
        loadingDate: new Date(validatedData.loadingDate),
        requiredByDate: new Date(validatedData.requiredByDate),
      },
    });

    // Create initial status history
    await prisma.dealStatusHistory.create({
      data: {
        requestId: request.id,
        status: DealStatus.PENDING,
        comment: 'Заявка создана',
      },
    });

    revalidatePath('/seeker/requests');
    return { success: true, data: request };
  } catch (error) {
    console.error('Failed to create request:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Не удалось создать заявку' 
    };
  }
}

export async function updateRequest(id: number, data: z.infer<typeof requestFormSchema>) {
  try {
    const validatedData = requestFormSchema.parse(data);
    
    // Check if request belongs to user's company
    const existingRequest = await prisma.request.findFirst({
      where: {
        id,
        companyId: mockUser.companyId,
      },
    });

    if (!existingRequest) {
      return { success: false, error: 'Заявка не найдена' };
    }

    const request = await prisma.request.update({
      where: { id },
      data: {
        ...validatedData,
        loadingDate: new Date(validatedData.loadingDate),
        requiredByDate: new Date(validatedData.requiredByDate),
      },
    });

    // Create status history for update
    await prisma.dealStatusHistory.create({
      data: {
        requestId: request.id,
        status: DealStatus.PENDING,
        comment: 'Заявка обновлена',
      },
    });

    revalidatePath('/seeker/requests');
    revalidatePath(`/seeker/requests/${id}`);
    return { success: true, data: request };
  } catch (error) {
    console.error('Failed to update request:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Не удалось обновить заявку' 
    };
  }
}

export async function cancelRequest(id: number) {
  try {
    // Check if request belongs to user's company
    const existingRequest = await prisma.request.findFirst({
      where: {
        id,
        companyId: mockUser.companyId,
      },
    });

    if (!existingRequest) {
      return { success: false, error: 'Заявка не найдена' };
    }

    // Create status history for cancellation
    await prisma.dealStatusHistory.create({
      data: {
        requestId: id,
        status: DealStatus.CANCELLED,
        comment: 'Заявка отменена пользователем',
      },
    });

    revalidatePath('/seeker/requests');
    return { success: true };
  } catch (error) {
    console.error('Failed to cancel request:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Не удалось отменить заявку' 
    };
  }
}

export async function getRequests(page: number = 1, filters?: {
  status?: DealStatus;
  wagonType?: string;
  startDate?: string;
  endDate?: string;
}) {
  const limit = 10;
  const offset = (page - 1) * limit;

  const where = {
    companyId: mockUser.companyId,
    ...(filters?.status && {
      dealStatusHistories: {
        some: {
          status: filters.status,
        },
      },
    }),
    ...(filters?.wagonType && {
      wagonType: filters.wagonType as any,
    }),
    ...(filters?.startDate && filters?.endDate && {
      loadingDate: {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      },
    }),
  };

  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where,
      include: {
        dealStatusHistories: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            matches: true,
            threads: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.request.count({ where }),
  ]);

  return {
    requests,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getRequest(id: number) {
  const request = await prisma.request.findFirst({
    where: {
      id,
      companyId: mockUser.companyId,
    },
    include: {
      dealStatusHistories: {
        orderBy: { createdAt: 'desc' },
      },
      matches: {
        include: {
          offer: {
            include: {
              company: true,
            },
          },
        },
      },
      threads: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  return request;
}