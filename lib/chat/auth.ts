import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function verifyThreadAccess(threadId: number, userId: number): Promise<boolean> {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: {
      operatorId: true,
      seekerId: true,
    },
  });

  if (!thread) {
    return false;
  }

  return thread.operatorId === userId || thread.seekerId === userId;
}

export async function isOperatorUser(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === 'OPERATOR';
}

export async function isSeekerUser(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === 'SEEKER';
}

export function getUserIdFromRequest(request: NextRequest): number | null {
  // TODO: Integrate with real authentication system (NextAuth.js or similar)
  // For now, reading from x-user-id header for development
  const userIdHeader = request.headers.get('x-user-id');
  if (!userIdHeader) {
    return null;
  }

  const userId = parseInt(userIdHeader, 10);
  if (isNaN(userId)) {
    return null;
  }

  return userId;
}