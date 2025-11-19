/**
 * POST /api/match
 * Returns scored offers matching a request
 * 
 * Query parameters:
 *   - requestId: Request ID to match against
 * 
 * Returns:
 *   - Array of matched offers with scores, sorted by score descending
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreMatch, MatchScore } from '@/lib/matching';
import { matchingConfig } from '@/config/matching';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestIdParam = searchParams.get('requestId');

    if (!requestIdParam) {
      return NextResponse.json(
        { error: 'requestId parameter is required' },
        { status: 400 }
      );
    }

    const requestId = parseInt(requestIdParam, 10);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: 'requestId must be a valid number' },
        { status: 400 }
      );
    }

    // TODO: Verify user is authenticated and is a seeker
    // TODO: Verify user owns this request (via company)
    const mockSeekerCompanyId = 2; // From seed data

    // Fetch the request
    const targetRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: { company: true },
    });

    if (!targetRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Verify ownership (seeker company)
    if (targetRequest.companyId !== mockSeekerCompanyId) {
      return NextResponse.json(
        { error: 'Unauthorized: request does not belong to your company' },
        { status: 403 }
      );
    }

    // Fetch all active (non-archived) offers
    const offers = await prisma.offer.findMany({
      where: {
        isArchived: false,
      },
      include: {
        company: true,
        createdBy: true,
      },
    });

    // Score each offer
    const scoredMatches = offers
      .map((offer) => {
        const matchScore = scoreMatch(offer, targetRequest);
        return {
          offer,
          ...matchScore,
        };
      })
      // Filter by minimum threshold
      .filter((match) => match.score >= matchingConfig.minScoreThreshold * 100)
      // Sort by score descending
      .sort((a, b) => b.score - a.score);

    // Store/update Match records in database
    for (const match of scoredMatches) {
      await prisma.match.upsert({
        where: {
          offerId_requestId: {
            offerId: match.offer.id,
            requestId: targetRequest.id,
          },
        },
        create: {
          offerId: match.offer.id,
          requestId: targetRequest.id,
          score: match.score / 100, // Store as 0-1 scale
          status: 'PENDING',
          metadata: JSON.stringify({
            reasons: match.reasons,
            metadata: match.metadata,
            computedAt: new Date().toISOString(),
          }),
        },
        update: {
          score: match.score / 100,
          metadata: JSON.stringify({
            reasons: match.reasons,
            metadata: match.metadata,
            computedAt: new Date().toISOString(),
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      requestId: targetRequest.id,
      requestDetails: {
        cargoType: targetRequest.cargoType,
        departureRegion: targetRequest.departureRegion,
        arrivalRegion: targetRequest.arrivalRegion,
      },
      matches: scoredMatches.map((match) => ({
        id: match.offer.id,
        offerId: match.offer.id,
        score: match.score,
        offer: {
          id: match.offer.id,
          wagonType: match.offer.wagonType,
          cargoType: match.offer.cargoType,
          wagonCount: match.offer.wagonCount,
          departureStation: match.offer.departureStation,
          departureRegion: match.offer.departureRegion,
          arrivalStation: match.offer.arrivalStation,
          arrivalRegion: match.offer.arrivalRegion,
          availableFrom: match.offer.availableFrom,
          availableUntil: match.offer.availableUntil,
          pricePerWagon: match.offer.pricePerWagon,
          description: match.offer.description,
        },
        company: {
          id: match.offer.company.id,
          name: match.offer.company.name,
          description: match.offer.company.description,
        },
        reasons: match.reasons,
        metadata: match.metadata,
      })),
      count: scoredMatches.length,
    });
  } catch (error) {
    console.error('Match API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
