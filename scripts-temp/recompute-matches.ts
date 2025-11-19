/**
 * Background Job: Recompute Matches
 * 
 * This script recomputes all matches in the system by:
 * 1. Finding all active requests
 * 2. For each request, scoring all active offers
 * 3. Updating the Match records with new scores
 * 
 * Usage:
 *   npx tsx scripts/recompute-matches.ts
 * 
 * Can be scheduled as a cron job or run on-demand when:
 * - A new offer is created
 * - An offer is updated
 * - A request is created
 * - A request is updated
 * 
 * For production, this should be:
 * - Run in a background queue (e.g., Bull, RabbitMQ)
 * - Batched to avoid overwhelming the database
 * - Scheduled to run periodically (e.g., every hour)
 */

import { prisma } from '@/lib/prisma';
import { scoreMatch } from '@/lib/matching';

interface RecomputeOptions {
  requestIds?: number[];
  verbose?: boolean;
}

async function recomputeMatches(options: RecomputeOptions = {}) {
  const { requestIds, verbose = false } = options;

  try {
    if (verbose) {
      console.log('🔄 Starting match recomputation...');
    }

    // Fetch all active requests (or specific ones)
    const requestWhere = requestIds ? { id: { in: requestIds } } : {};
    const requests = await prisma.request.findMany({
      where: requestWhere,
    });

    if (verbose) {
      console.log(`📋 Found ${requests.length} request(s) to process`);
    }

    // Fetch all active offers (non-archived)
    const offers = await prisma.offer.findMany({
      where: {
        isArchived: false,
      },
    });

    if (verbose) {
      console.log(`📦 Found ${offers.length} active offer(s)`);
    }

    let totalMatches = 0;
    let totalScored = 0;

    // Process each request
    for (const request of requests) {
      if (verbose) {
        console.log(`\n📌 Processing request #${request.id}...`);
      }

      // Score each offer against this request
      for (const offer of offers) {
        try {
          const matchScore = scoreMatch(offer, request);
          totalScored++;

          // Update or create match record
          const match = await prisma.match.upsert({
            where: {
              offerId_requestId: {
                offerId: offer.id,
                requestId: request.id,
              },
            },
            create: {
              offerId: offer.id,
              requestId: request.id,
              score: matchScore.score / 100,
              status: 'PENDING',
              metadata: JSON.stringify({
                reasons: matchScore.reasons,
                metadata: matchScore.metadata,
                computedAt: new Date().toISOString(),
              }),
            },
            update: {
              score: matchScore.score / 100,
              metadata: JSON.stringify({
                reasons: matchScore.reasons,
                metadata: matchScore.metadata,
                computedAt: new Date().toISOString(),
              }),
            },
          });

          totalMatches++;

          if (verbose && matchScore.score >= 50) {
            console.log(`  ✓ Match #${match.id}: Score ${matchScore.score}/100`);
          }
        } catch (error) {
          console.error(
            `❌ Error scoring offer #${offer.id} against request #${request.id}:`,
            error
          );
        }
      }
    }

    if (verbose) {
      console.log(`\n✅ Recomputation complete!`);
      console.log(`  - Requests processed: ${requests.length}`);
      console.log(`  - Offers scored: ${totalScored}`);
      console.log(`  - Matches updated: ${totalMatches}`);
    }

    return {
      success: true,
      requestsProcessed: requests.length,
      offersScored: totalScored,
      matchesUpdated: totalMatches,
    };
  } catch (error) {
    console.error('❌ Error during recomputation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// If run directly (not imported)
if (require.main === module) {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  recomputeMatches({ verbose }).then((result) => {
    process.exit(result.success ? 0 : 1);
  });
}

export { recomputeMatches };
export type { RecomputeOptions };
