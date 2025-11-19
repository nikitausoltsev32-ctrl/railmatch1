'use server';

import { prisma } from '@/lib/prisma';
import { DealStatus } from '@prisma/client';

// Define valid status transitions
export const validTransitions: Record<DealStatus, DealStatus[]> = {
  PENDING: ['NEGOTIATING', 'ACCEPTED', 'REJECTED'],
  NEGOTIATING: ['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
  ACCEPTED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [], // Terminal state
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

export async function updateDealStatus({
  matchId,
  requestId,
  newStatus,
  comment,
  userId,
}: {
  matchId?: number;
  requestId?: number;
  newStatus: DealStatus;
  comment?: string;
  userId: number;
}) {
  try {
    // Get current status
    let currentStatus: DealStatus | null = null;
    
    if (matchId) {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { dealStatusHistories: true },
      });
      
      if (!match) {
        throw new Error('Match not found');
      }
      
      // Get latest status from history
      const latestHistory = match.dealStatusHistories
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      
      currentStatus = latestHistory?.status || 'PENDING';
    } else if (requestId) {
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: { dealStatusHistories: true },
      });
      
      if (!request) {
        throw new Error('Request not found');
      }
      
      // Get latest status from history
      const latestHistory = request.dealStatusHistories
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      
      currentStatus = latestHistory?.status || 'PENDING';
    } else {
      throw new Error('Either matchId or requestId must be provided');
    }

    // Validate transition
    if (currentStatus && !validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    // Create new status history entry
    const statusHistory = await prisma.dealStatusHistory.create({
      data: {
        matchId,
        requestId,
        status: newStatus,
        comment: comment || null,
      },
      include: {
        match: {
          include: {
            offer: {
              include: {
                company: true,
              },
            },
            request: {
              include: {
                company: true,
              },
            },
          },
        },
        request: {
          include: {
            company: true,
          },
        },
      },
    });

    return { success: true, statusHistory };
  } catch (error) {
    console.error('Error updating deal status:', error);
    throw error;
  }
}

export async function getDealStatusHistory({
  matchId,
  requestId,
}: {
  matchId?: number;
  requestId?: number;
}) {
  try {
    const history = await prisma.dealStatusHistory.findMany({
      where: {
        OR: [
          { matchId },
          { requestId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        match: {
          include: {
            offer: {
              include: {
                company: true,
              },
            },
            request: {
              include: {
                company: true,
              },
            },
          },
        },
        request: {
          include: {
            company: true,
          },
        },
      },
    });

    return history;
  } catch (error) {
    console.error('Error getting deal status history:', error);
    throw error;
  }
}

export async function getOperatorResponses(operatorCompanyId: number) {
  try {
    // Get matches for operator's offers with deal status history
    const matches = await prisma.match.findMany({
      where: {
        offer: {
          companyId: operatorCompanyId,
        },
      },
      include: {
        offer: {
          include: {
            company: true,
          },
        },
        request: {
          include: {
            company: true,
          },
        },
        dealStatusHistories: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        threads: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get latest status for each match
    const matchesWithStatus = matches.map(match => {
      const latestHistory = match.dealStatusHistories[0];
      const lastMessage = match.threads[0]?.messages[0];
      
      return {
        ...match,
        currentStatus: latestHistory?.status || 'PENDING',
        lastMessage: lastMessage || null,
        latestHistory: latestHistory || null,
      };
    });

    return matchesWithStatus;
  } catch (error) {
    console.error('Error getting operator responses:', error);
    throw error;
  }
}

export async function getSeekerInbox(seekerCompanyId: number) {
  try {
    // Get matches for seeker's requests with deal status history
    const matches = await prisma.match.findMany({
      where: {
        request: {
          companyId: seekerCompanyId,
        },
      },
      include: {
        offer: {
          include: {
            company: true,
          },
        },
        request: {
          include: {
            company: true,
          },
        },
        dealStatusHistories: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        threads: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get latest status for each match
    const matchesWithStatus = matches.map(match => {
      const latestHistory = match.dealStatusHistories[0];
      const lastMessage = match.threads[0]?.messages[0];
      
      return {
        ...match,
        currentStatus: latestHistory?.status || 'PENDING',
        lastMessage: lastMessage || null,
        latestHistory: latestHistory || null,
      };
    });

    return matchesWithStatus;
  } catch (error) {
    console.error('Error getting seeker inbox:', error);
    throw error;
  }
}

export async function createResponseThread({
  matchId,
  requestId,
  subject,
  initialMessage,
  senderId,
}: {
  matchId?: number;
  requestId?: number;
  subject: string;
  initialMessage: string;
  senderId: number;
}) {
  try {
    // Create thread
    const thread = await prisma.thread.create({
      data: {
        matchId,
        requestId,
        subject,
        isActive: true,
      },
    });

    // Create initial message
    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        senderId,
        content: initialMessage,
      },
    });

    return { thread, message };
  } catch (error) {
    console.error('Error creating response thread:', error);
    throw error;
  }
}