import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest, verifyThreadAccess } from '@/lib/chat/auth';
import { CreateMessageRequest, MessageResponse, PollingResponse } from '@/lib/chat/types';
import { saveFile, maskContact } from '@/lib/chat/files';
import { shouldMaskContacts, updateLastReadTimestamp } from '@/lib/chat/helpers';

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
    const threadId = parseInt(searchParams.get('threadId') || '', 10);
    const since = searchParams.get('since');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!threadId) {
      return NextResponse.json(
        { error: 'Идентификатор чата обязателен' },
        { status: 400 }
      );
    }

    // Verify user has access to this thread
    const hasAccess = await verifyThreadAccess(threadId, userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Build where clause
    const whereClause: any = { threadId };
    if (since) {
      whereClause.createdAt = { gt: new Date(since) };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    // Get thread info for masking logic
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: {
        operatorId: true,
        seekerId: true,
        lastReadAt: true,
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Чат не найден' },
        { status: 404 }
      );
    }

    // Update last read timestamp for this user
    const updatedLastReadAt = updateLastReadTimestamp(thread.lastReadAt, userId);
    await prisma.thread.update({
      where: { id: threadId },
      data: { lastReadAt: updatedLastReadAt },
    });

    // Transform messages
    const transformedMessages: MessageResponse[] = messages.map((message) => {
      const attachments = message.attachments ? JSON.parse(message.attachments) : [];
      
      // Apply contact masking to sender email if needed
      let senderEmail = message.sender.email;
      if (thread.operatorId && thread.seekerId) {
        const shouldMask = shouldMaskContacts(
          thread.operatorId,
          thread.seekerId,
          [{ senderId: message.senderId }]
        );

        if (shouldMask && message.senderId !== userId) {
          senderEmail = maskContact(message.sender.email);
        }
      }

      return {
        id: message.id,
        threadId: message.threadId,
        senderId: message.senderId,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          email: senderEmail,
        },
        content: message.content,
        attachments,
        createdAt: message.createdAt.toISOString(),
      };
    });

    // Determine next poll interval (5-10 seconds random)
    const nextPoll = Math.floor(Math.random() * 5000) + 5000;

    const response: PollingResponse = {
      messages: transformedMessages,
      nextPoll,
      hasMore: messages.length === limit,
      lastTimestamp: messages.length > 0 
        ? messages[messages.length - 1]!.createdAt.toISOString()
        : new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const threadId = parseInt(formData.get('threadId') as string, 10);
    const content = formData.get('content') as string;
    const attachments = formData.getAll('attachments') as File[];

    if (!threadId || !content) {
      return NextResponse.json(
        { error: 'Идентификатор чата и содержание сообщения обязательны' },
        { status: 400 }
      );
    }

    // Verify user has access to this thread
    const hasAccess = await verifyThreadAccess(threadId, userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Process attachments
    const processedAttachments = [];
    for (const attachment of attachments) {
      try {
        const savedFile = await saveFile(attachment);
        processedAttachments.push(savedFile);
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Ошибка при сохранении файла' },
          { status: 400 }
        );
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        threadId,
        senderId: userId,
        content,
        attachments: processedAttachments.length > 0 
          ? JSON.stringify(processedAttachments) 
          : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update thread timestamp
    await prisma.thread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    // Get thread info for masking logic
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: {
        operatorId: true,
        seekerId: true,
      },
    });

    // Apply contact masking if needed
    let senderEmail = message.sender.email;
    if (thread?.operatorId && thread?.seekerId) {
      const shouldMask = shouldMaskContacts(
        thread.operatorId,
        thread.seekerId,
        [{ senderId: message.senderId }]
      );

      if (shouldMask) {
        senderEmail = maskContact(message.sender.email);
      }
    }

      const response: MessageResponse = {
        id: message.id,
        threadId: message.threadId,
        senderId: message.senderId,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          email: senderEmail,
        },
        content: message.content,
        attachments: processedAttachments,
        createdAt: message.createdAt.toISOString(),
      };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}