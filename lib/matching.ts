/**
 * Matching Service - Scoring Algorithm
 * Computes compatibility scores between offers and requests
 */

import { Offer, Request, WagonType, CargoType } from '@prisma/client';
import { matchingConfig } from '@/config/matching';

export interface ScoringReason {
  factor: string;
  label: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface MatchScore {
  score: number; // 0-100
  reasons: ScoringReason[];
  metadata: {
    wagonTypeMatch: number;
    cargoTypeMatch: number;
    dateOverlap: number;
    regionalProximity: number;
    priceMatch: number;
  };
}

/**
 * Calculate wagon type compatibility score
 * If request specifies wagon type, check compatibility; otherwise give neutral score
 */
function calculateWagonTypeScore(
  offerWagon: WagonType,
  requestWagon: WagonType | null
): { score: number; explanation: string } {
  if (requestWagon === null) {
    // Request doesn't specify wagon type - give neutral score
    return {
      score: 0.7,
      explanation: 'Тип вагона не указан в заявке',
    };
  }

  if (offerWagon === requestWagon) {
    return {
      score: 1.0,
      explanation: `Тип вагона совпадает: ${offerWagon}`,
    };
  }

  return {
    score: 0.6,
    explanation: `Тип вагона отличается (предложение: ${offerWagon}, заявка: ${requestWagon})`,
  };
}

/**
 * Calculate cargo type compatibility score using the compatibility matrix
 */
function calculateCargoTypeScore(
  cargoType: CargoType,
  offerWagon: WagonType
): { score: number; explanation: string } {
  const compatibility = matchingConfig.cargoWagonCompatibility[cargoType]?.[offerWagon];

  if (compatibility === undefined) {
    return {
      score: 0.5,
      explanation: `Неизвестная совместимость груза ${cargoType} с вагоном ${offerWagon}`,
    };
  }

  if (compatibility === 1.0) {
    return {
      score: 1.0,
      explanation: `Идеальная совместимость груза и вагона`,
    };
  }

  if (compatibility >= 0.8) {
    return {
      score: compatibility,
      explanation: `Хорошая совместимость груза и вагона`,
    };
  }

  if (compatibility >= 0.5) {
    return {
      score: compatibility,
      explanation: `Приемлемая совместимость груза и вагона`,
    };
  }

  return {
    score: compatibility,
    explanation: `Слабая совместимость груза и вагона`,
  };
}

/**
 * Calculate date overlap score between offer availability and request date range
 * Returns 1.0 if dates overlap perfectly, 0 if no overlap
 */
function calculateDateOverlapScore(
  offerFrom: Date,
  offerUntil: Date,
  requestLoadingDate: Date,
  requestRequiredByDate: Date
): { score: number; explanation: string } {
  // Check if date ranges overlap
  if (offerFrom > requestRequiredByDate || offerUntil < requestLoadingDate) {
    return {
      score: 0,
      explanation: 'Даты доступности вагона и сроки доставки не совпадают',
    };
  }

  // Calculate overlap period
  const overlapStart = new Date(Math.max(offerFrom.getTime(), requestLoadingDate.getTime()));
  const overlapEnd = new Date(Math.min(offerUntil.getTime(), requestRequiredByDate.getTime()));
  const overlapDays = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24);

  if (overlapDays < matchingConfig.minDateOverlapDays) {
    return {
      score: 0.3,
      explanation: 'Минимальное совпадение дат',
    };
  }

  // Calculate percentage of request date range that overlaps with offer availability
  const requestDays = (requestRequiredByDate.getTime() - requestLoadingDate.getTime()) / (1000 * 60 * 60 * 24);
  const overlapPercentage = Math.min(1.0, overlapDays / requestDays);

  if (overlapPercentage >= 0.9) {
    return {
      score: 1.0,
      explanation: 'Даты идеально совпадают',
    };
  }

  if (overlapPercentage >= 0.7) {
    return {
      score: 0.9,
      explanation: 'Даты хорошо совпадают',
    };
  }

  if (overlapPercentage >= 0.5) {
    return {
      score: 0.7,
      explanation: 'Даты приемлемо совпадают',
    };
  }

  return {
    score: 0.4,
    explanation: 'Частичное совпадение дат',
  };
}

/**
 * Calculate regional proximity score
 * Uses predefined proximity matrix with special cases for same-region matches
 */
function calculateRegionalProximityScore(
  offerDeparture: string,
  offerArrival: string,
  requestDeparture: string,
  requestArrival: string
): { score: number; explanation: string } {
  // Check same region matches first
  if (offerDeparture === requestDeparture && offerArrival === requestArrival) {
    return {
      score: 1.0,
      explanation: 'Маршруты полностью совпадают',
    };
  }

  // Check partial matches
  const departureMatch = offerDeparture === requestDeparture ? 0.5 : 0;
  const arrivalMatch = offerArrival === requestArrival ? 0.5 : 0;
  const partialMatchScore = departureMatch + arrivalMatch;

  if (partialMatchScore > 0) {
    return {
      score: Math.min(0.9, 0.6 + partialMatchScore),
      explanation: partialMatchScore === 1.0
        ? 'Маршруты совпадают (один из регионов совпадает)'
        : 'Один регион совпадает с маршрутом',
    };
  }

  // Use proximity matrix for different routes
  const key1 = `${offerDeparture}, ${requestDeparture}`;
  const key2 = `${requestDeparture}, ${offerDeparture}`;

  let proximity = matchingConfig.regionalProximity[key1];
  if (proximity === undefined) {
    proximity = matchingConfig.regionalProximity[key2];
  }

  if (proximity !== undefined) {
    return {
      score: proximity,
      explanation: `Регионы находятся на приемлемом расстоянии`,
    };
  }

  // Default for unknown proximity
  return {
    score: 0.4,
    explanation: 'Регионы удалены, но маршрут возможен',
  };
}

/**
 * Calculate price compatibility score
 * Offer price should be within tolerance of request max price
 */
function calculatePriceMatchScore(
  offerPrice: number,
  requestMaxPrice: number | null
): { score: number; explanation: string } {
  if (requestMaxPrice === null) {
    // Request doesn't specify max price - neutral score
    return {
      score: 0.7,
      explanation: 'Максимальная цена не указана в заявке',
    };
  }

  if (offerPrice <= requestMaxPrice) {
    return {
      score: 1.0,
      explanation: `Цена предложения ниже максимума (${offerPrice} ≤ ${requestMaxPrice})`,
    };
  }

  const exceededPercent = ((offerPrice - requestMaxPrice) / requestMaxPrice) * 100;
  const tolerance = matchingConfig.priceTolerancePercentage;

  if (exceededPercent <= tolerance) {
    const score = Math.max(0.5, 1.0 - (exceededPercent / tolerance) * 0.5);
    return {
      score,
      explanation: `Цена превышена на ${exceededPercent.toFixed(1)}%, но в пределах допуска (${tolerance}%)`,
    };
  }

  // Beyond tolerance
  const score = Math.max(0.2, 1.0 - (exceededPercent / 100) * 0.8);
  return {
    score,
    explanation: `Цена значительно превышена (${exceededPercent.toFixed(1)}%)`,
  };
}

/**
 * Main scoring function - calculates total match score between offer and request
 */
export function scoreMatch(offer: Offer, request: Request): MatchScore {
  // Calculate individual component scores
  const wagonTypeResult = calculateWagonTypeScore(offer.wagonType, request.wagonType);
  const cargoTypeResult = calculateCargoTypeScore(request.cargoType, offer.wagonType);
  const dateOverlapResult = calculateDateOverlapScore(
    offer.availableFrom,
    offer.availableUntil,
    request.loadingDate,
    request.requiredByDate
  );
  const regionalProximityResult = calculateRegionalProximityScore(
    offer.departureRegion,
    offer.arrivalRegion,
    request.departureRegion,
    request.arrivalRegion
  );
  const priceMatchResult = calculatePriceMatchScore(offer.pricePerWagon, request.maxPricePerWagon);

  // Build reasons array with weights
  const reasons: ScoringReason[] = [
    {
      factor: 'wagonType',
      label: 'Тип вагона',
      score: wagonTypeResult.score,
      weight: matchingConfig.weights.wagonType,
      explanation: wagonTypeResult.explanation,
    },
    {
      factor: 'cargoType',
      label: 'Совместимость груза и вагона',
      score: cargoTypeResult.score,
      weight: matchingConfig.weights.cargoType,
      explanation: cargoTypeResult.explanation,
    },
    {
      factor: 'dateOverlap',
      label: 'Совпадение дат',
      score: dateOverlapResult.score,
      weight: matchingConfig.weights.dateOverlap,
      explanation: dateOverlapResult.explanation,
    },
    {
      factor: 'regionalProximity',
      label: 'Географическая близость маршрутов',
      score: regionalProximityResult.score,
      weight: matchingConfig.weights.regionalProximity,
      explanation: regionalProximityResult.explanation,
    },
    {
      factor: 'priceMatch',
      label: 'Совпадение цены',
      score: priceMatchResult.score,
      weight: matchingConfig.weights.priceMatch,
      explanation: priceMatchResult.explanation,
    },
  ];

  // Calculate weighted score (0-1 scale)
  const weightedScore = reasons.reduce((sum, reason) => {
    return sum + reason.score * reason.weight;
  }, 0);

  // Convert to 0-100 scale
  const finalScore = Math.round(weightedScore * 100);

  return {
    score: finalScore,
    reasons,
    metadata: {
      wagonTypeMatch: wagonTypeResult.score,
      cargoTypeMatch: cargoTypeResult.score,
      dateOverlap: dateOverlapResult.score,
      regionalProximity: regionalProximityResult.score,
      priceMatch: priceMatchResult.score,
    },
  };
}
