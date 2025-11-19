'use client';

/**
 * Matches Content Component
 * Main content area for displaying matches with request selector
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MatchCard } from './MatchCard';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { copy } from '@/lib/i18n/ru';
import { ScoringReason } from '@/lib/matching';

interface Request {
  id: number;
  cargoType: string;
  departureRegion: string;
  arrivalRegion: string;
  loadingDate: string;
  requiredByDate: string;
}

interface Match {
  id: number;
  offerId: number;
  score: number;
  offer: {
    id: number;
    wagonType: string;
    cargoType: string;
    wagonCount: number;
    departureStation: string;
    departureRegion: string;
    arrivalStation: string;
    arrivalRegion: string;
    availableFrom: string;
    availableUntil: string;
    pricePerWagon: number;
    description: string | null;
  };
  company: {
    id: number;
    name: string;
    description: string | null;
  };
  reasons: ScoringReason[];
}

interface MatchesContentProps {
  requests: Request[];
  initialRequestId?: number;
}

export function MatchesContent({ requests, initialRequestId }: MatchesContentProps) {
  const router = useRouter();
  const matchesCopy = copy.seeker.matches;
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(initialRequestId || null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load matches when request selection changes
  useEffect(() => {
    if (!selectedRequestId) {
      setMatches([]);
      return;
    }

    const loadMatches = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/match?requestId=${selectedRequestId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка при загрузке совпадений');
        }

        const data = await response.json();
        setMatches(data.matches || []);
      } catch (err) {
        console.error('Error loading matches:', err);
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке совпадений');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequestId]);

  const handleContact = useCallback((offerId: number) => {
    // TODO: Implement chat/thread creation flow
    console.log('Contact about offer:', offerId);
  }, []);

  const handleRespond = useCallback((offerId: number) => {
    // TODO: Implement response creation flow
    console.log('Send response for offer:', offerId);
  }, []);

  const handleSave = useCallback((offerId: number) => {
    // TODO: Implement favorite marking
    console.log('Save offer:', offerId);
  }, []);

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 mx-auto text-neutral-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{matchesCopy.noRequests}</h3>
          <p className="text-neutral-600 mb-6">{copy.seeker.requests.empty.description}</p>
          <Button
            variant="primary"
            onClick={() => router.push('/seeker/requests/new')}
          >
            {copy.seeker.requests.empty.createButton}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Request selector */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          {matchesCopy.selectRequest}
        </label>
        <Select
          value={selectedRequestId ? String(selectedRequestId) : ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            setSelectedRequestId(value ? parseInt(value, 10) : null);
          }}
        >
          <option value="">{matchesCopy.selectRequestPlaceholder}</option>
          {requests.map((request) => (
            <option key={request.id} value={request.id}>
              {request.cargoType} • {request.departureRegion} → {request.arrivalRegion}
            </option>
          ))}
        </Select>
      </div>

      {/* Matches list */}
      {selectedRequestId && (
        <div>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4" />
                <p className="text-neutral-600">{matchesCopy.loading}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{matchesCopy.error}</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && matches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-neutral-50 border border-neutral-200 rounded-lg">
              <div className="text-center max-w-md">
                <svg
                  className="w-16 h-16 mx-auto text-neutral-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{matchesCopy.noMatches}</h3>
                <p className="text-neutral-600">{matchesCopy.noMatchesDescription}</p>
              </div>
            </div>
          )}

          {!loading && !error && matches.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-neutral-600">
                Найдено совпадений: <span className="font-semibold text-neutral-900">{matches.length}</span>
              </div>
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  offerId={match.offerId}
                  score={match.score}
                  offer={match.offer}
                  company={match.company}
                  reasons={match.reasons}
                  onContact={handleContact}
                  onRespond={handleRespond}
                  onSave={handleSave}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
