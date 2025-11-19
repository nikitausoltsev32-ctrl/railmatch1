import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest, verifyThreadAccess, isOperatorUser, isSeekerUser } from '@/lib/chat/auth';
import { CreateThreadRequest, ThreadListResponse, ThreadResponse } from '@/lib/chat/types';
import { maskContact } from '@/lib/chat/files';
import { shouldMaskContacts } from '@/lib/chat/helpers';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const body: CreateThreadRequest = await request.json();
    const { matchId, requestId, subject, operatorId, seekerId } = body;

    // Validate required fields
    if (!subject || (!matchId && !requestId)) {
      return NextResponse.json(
        { error: 'Тема и идентификатор матча или заявки обязательны' },
        { status: 400 }
      );
    }

    // Get user role
    const userRole = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!userRole) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Determine participants based on user role
    let finalOperatorId = operatorId;
    let finalSeekerId = seekerId;

    if (userRole.role === 'OPERATOR') {
      finalOperatorId = userId;
      if (!finalSeekerId) {
        // If seekerId not provided, try to get from match/request
        if (matchId) {
          const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { request: { select: { createdById: true } } },
          });
          if (!match) {
            return NextResponse.json(
              { error: 'Матч не найден' },
              { status: 404 }
            );
          }
          finalSeekerId = match.request.createdById;
        } else if (requestId) {
          const request = await prisma.request.findUnique({
            where: { id: requestId },
            select: { createdById: true },
          });
          if (!request) {
            return NextResponse.json(
              { error: 'Заявка не найдена' },
              { status: 404 }
            );
          }
          finalSeekerId = request.createdById;
        }
      }
    } else if (userRole.role === 'SEEKER') {
      finalSeekerId = userId;
      if (!finalOperatorId) {
        // If operatorId not provided, try to get from match
        if (matchId) {
          const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { offer: { select: { createdById: true } } },
          });
          if (!match) {
            return NextResponse.json(
              { error: 'Матч не найден' },
              { status: 404 }
            );
          }
          finalOperatorId = match.offer.createdById;
        } else {
          return NextResponse.json(
            { error: 'Для создания чата по заявке требуется указать оператора' },
            { status: 400 }
          );
        }
      }
    }

    // Create thread
    const thread = await prisma.thread.create({
      data: {
        matchId,
        requestId,
        subject,
        operatorId: finalOperatorId,
        seekerId: finalSeekerId,
      },
      include: {
        operator: {
          include: {
            company: { select: { id: true, name: true } },
          },
        },
        seeker: {
          include: {
            company: { select: { id: true, name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Transform response
    const response: ThreadResponse = {
      id: thread.id,
      subject: thread.subject,
      operatorId: thread.operatorId,
      seekerId: thread.seekerId,
      operator: thread.operator ? {
        id: thread.operator.id,
        name: thread.operator.name,
        email: thread.operator.email,
        company: thread.operator.company,
      } : null,
      seeker: thread.seeker ? {
        id: thread.seeker.id,
        name: thread.seeker.name,
        email: thread.seeker.email,
        company: thread.seeker.company,
      } : null,
      lastMessage: thread.messages[0] ? {
        content: thread.messages[0].content,
        createdAt: thread.messages[0].createdAt.toISOString(),
        senderId: thread.messages[0].senderId,
      } : undefined,
      unreadCount: 0, // New thread has no unread messages
      isActive: thread.isActive,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
    };

    // Apply contact masking if needed
    if (response.operator && response.seeker) {
      const shouldMask = shouldMaskContacts(
        response.operator.id,
        response.seeker.id,
        thread.messages
      );

      if (shouldMask) {
        response.operator.email = maskContact(response.operator.email);
        response.seeker.email = maskContact(response.seeker.email);
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Get threads where user is participant
    const threads = await prisma.thread.findMany({
      where: {
        OR: [
          { operatorId: userId },
          { seekerId: userId },
        ],
      },
      include: {
        operator: {
          include: {
            company: { select: { id: true, name: true } },
          },
        },
        seeker: {
          include: {
            company: { select: { id: true, name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Get total count
    const total = await prisma.thread.count({
      where: {
        OR: [
          { operatorId: userId },
          { seekerId: userId },
        ],
      },
    });

    // Transform threads
    const transformedThreads: ThreadResponse[] = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await calculateUnreadCount(
          thread.id,
          userId,
          thread.lastReadAt
        );

        const response: ThreadResponse = {
          id: thread.id,
          subject: thread.subject,
          operatorId: thread.operatorId,
          seekerId: thread.seekerId,
          operator: thread.operator ? {
            id: thread.operator.id,
            name: thread.operator.name,
            email: thread.operator.email,
            company: thread.operator.company,
          } : null,
          seeker: thread.seeker ? {
            id: thread.seeker.id,
            name: thread.seeker.name,
            email: thread.seeker.email,
            company: thread.seeker.company,
          } : null,
          lastMessage: thread.messages[0] ? {
            content: thread.messages[0].content,
            createdAt: thread.messages[0].createdAt.toISOString(),
            senderId: thread.messages[0].senderId,
          } : undefined,
          unreadCount,
          isActive: thread.isActive,
          createdAt: thread.createdAt.toISOString(),
          updatedAt: thread.updatedAt.toISOString(),
        };

        // Apply contact masking if needed
        if (response.operator && response.seeker) {
          const shouldMask = shouldMaskContacts(
            response.operator.id,
            response.seeker.id,
            thread.messages
          );

          if (shouldMask) {
            response.operator.email = maskContact(response.operator.email);
            response.seeker.email = maskContact(response.seeker.email);
          }
        }

        return response;
      })
    );

    const response: ThreadListResponse = {
      threads: transformedThreads,
      total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

async function calculateUnreadCount(threadId: number, userId: number, lastReadAtJson: string | null): Promise<number> {
  const messages = await prisma.message.findMany({
    where: { threadId },
    select: { createdAt: true, senderId: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!lastReadAtJson) {
    return messages.filter(msg => msg.senderId !== userId).length;
  }

  try {
    const lastReadAt = JSON.parse(lastReadAtJson);
    const userLastRead = lastReadAt[userId.toString()];
    
    if (!userLastRead) {
      return messages.filter(msg => msg.senderId !== userId).length;
    }

    const lastReadDate = new Date(userLastRead);
    
    return messages.filter(msg => 
      msg.senderId !== userId && 
      new Date(msg.createdAt) > lastReadDate
    ).length;
  } catch (error) {
    console.error('Error calculating unread count:', error);
    return messages.filter(msg => msg.senderId !== userId).length;
  }
}