/**
 * /seeker/matches
 * Matching results page for seekers
 * Shows scored offers matching their requests
 */

import { MatchesContent } from '@/components/matches/MatchesContent';
import { prisma } from '@/lib/prisma';
import { copy } from '@/lib/i18n/ru';

// Mock seeker company from seed data
const MOCK_SEEKER_COMPANY_ID = 2;

export const metadata = {
  title: 'Совпадения предложений - RailMatch',
  description: 'Найденные соответствия между вашими заявками и предложениями операторов',
};

async function getRequests() {
  try {
    const requests = await prisma.request.findMany({
      where: {
        companyId: MOCK_SEEKER_COMPANY_ID,
      },
      select: {
        id: true,
        cargoType: true,
        departureRegion: true,
        arrivalRegion: true,
        loadingDate: true,
        requiredByDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((req) => ({
      id: req.id,
      cargoType: req.cargoType,
      departureRegion: req.departureRegion,
      arrivalRegion: req.arrivalRegion,
      loadingDate: req.loadingDate.toISOString(),
      requiredByDate: req.requiredByDate.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
}

export default async function MatchesPage() {
  const requests = await getRequests();
  const matchesCopy = copy.seeker.matches;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">{matchesCopy.title}</h1>
        <p className="text-neutral-600 mt-2">{matchesCopy.subtitle}</p>
      </div>

      {/* Content */}
      <MatchesContent requests={requests} />
    </div>
  );
}
