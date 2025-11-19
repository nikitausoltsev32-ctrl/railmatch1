import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TODO: Implement proper authentication check
// For now, we'll allow access to all routes
// In production, this would check for valid session/cookies

export function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // For now, allow all requests
  // TODO: Add authentication logic here
  return NextResponse.next();
}

export const config = {
  matcher: ['/operator/:path*'],
};