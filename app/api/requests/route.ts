import { NextRequest, NextResponse } from 'next/server';
import { getRequests } from '@/lib/actions/requests';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const filters = {
      status: (searchParams.get('status') as any) || undefined,
      wagonType: searchParams.get('wagonType') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const data = await getRequests(page, filters);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}