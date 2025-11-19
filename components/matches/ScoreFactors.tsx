'use client';

/**
 * Score Factors Component
 * Displays breakdown of match score with weighted factors and explanations
 */

import { useState } from 'react';
import { ScoringReason } from '@/lib/matching';
import { copy } from '@/lib/i18n/ru';

interface ScoreFactorsProps {
  reasons: ScoringReason[];
}

export function ScoreFactors({ reasons }: ScoreFactorsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scoreFactorsLabels = copy.seeker.matches.scoreFactors;

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
      >
        <span className="font-medium text-neutral-900">{scoreFactorsLabels.title}</span>
        <svg
          className={`w-5 h-5 text-neutral-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-neutral-200 bg-neutral-50 divide-y divide-neutral-200">
          {reasons.map((reason) => (
            <div key={reason.factor} className="px-4 py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-neutral-900">{reason.label}</h4>
                  <p className="text-sm text-neutral-600 mt-1">{reason.explanation}</p>
                </div>
              </div>

              {/* Progress bar with score and weight */}
              <div className="space-y-2">
                {/* Score bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        reason.score >= 0.8
                          ? 'bg-green-500'
                          : reason.score >= 0.6
                            ? 'bg-yellow-500'
                            : reason.score >= 0.4
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${reason.score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 min-w-fit">
                    {Math.round(reason.score * 100)}%
                  </span>
                </div>

                {/* Weight indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600">
                    {scoreFactorsLabels.weight}
                    <span className="font-medium">{Math.round(reason.weight * 100)}%</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
