/**
 * Matching Algorithm Tests
 * 
 * Simple test runner for the matching/scoring algorithm.
 * Can be run with: npx tsx scripts/test-matching.ts
 * 
 * Tests cover:
 * - Perfect matches
 * - Wagon type matching
 * - Cargo type compatibility
 * - Date overlap
 * - Price matching
 * - Regional proximity
 * - Edge cases
 */

import { scoreMatch } from '@/lib/matching';
import { Offer, Request, WagonType, CargoType } from '@prisma/client';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Helper to create mock offers
function createMockOffer(overrides?: Partial<Offer>): Offer {
  const now = new Date();
  return {
    id: 1,
    companyId: 1,
    createdById: 1,
    wagonType: 'GONDOLA' as WagonType,
    cargoType: 'COAL' as CargoType,
    wagonCount: 50,
    departureStation: 'Кузбасс',
    departureRegion: 'Кемеровская область',
    arrivalStation: 'Новосибирск',
    arrivalRegion: 'Новосибирская область',
    availableFrom: now,
    availableUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    pricePerWagon: 45000,
    description: 'Test offer',
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// Helper to create mock requests
function createMockRequest(overrides?: Partial<Request>): Request {
  const now = new Date();
  return {
    id: 1,
    companyId: 2,
    createdById: 3,
    cargoType: 'COAL' as CargoType,
    wagonType: 'GONDOLA' as WagonType,
    cargoWeight: 3000,
    departureStation: 'Кемерово',
    departureRegion: 'Кемеровская область',
    arrivalStation: 'Новосибирск',
    arrivalRegion: 'Новосибирская область',
    loadingDate: now,
    requiredByDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    maxPricePerWagon: 48000,
    description: 'Test request',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// Test runner
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedTests++;
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  } else {
    failedTests++;
    console.log(`${colors.red}✗${colors.reset} ${message}`);
  }
}

function testSuite(name: string, tests: () => void) {
  console.log(`\n${colors.blue}${name}${colors.reset}`);
  tests();
}

// Run tests
function runTests() {
  console.log('\n🧪 Running Matching Algorithm Tests...\n');

  testSuite('Perfect Match', () => {
    const offer = createMockOffer();
    const request = createMockRequest();
    const result = scoreMatch(offer, request);

    assert(result.score >= 85, 'Perfect match should score 85+');
    assert(result.score <= 100, 'Score should not exceed 100');
    assert(result.reasons.length === 5, 'Should have 5 scoring factors');
  });

  testSuite('Wagon Type Matching', () => {
    const offer1 = createMockOffer({ wagonType: 'PLATFORM' });
    const request1 = createMockRequest({ wagonType: 'PLATFORM' });
    const result1 = scoreMatch(offer1, request1);
    const wagonFactor1 = result1.reasons.find((r) => r.factor === 'wagonType');
    assert(wagonFactor1?.score === 1.0, 'Matching wagon types should score 1.0');

    const offer2 = createMockOffer({ wagonType: 'PLATFORM' });
    const request2 = createMockRequest({ wagonType: 'GONDOLA' });
    const result2 = scoreMatch(offer2, request2);
    const wagonFactor2 = result2.reasons.find((r) => r.factor === 'wagonType');
    assert(wagonFactor2?.score === 0.6, 'Different wagon types should score 0.6');

    const offer3 = createMockOffer({ wagonType: 'PLATFORM' });
    const request3 = createMockRequest({ wagonType: null });
    const result3 = scoreMatch(offer3, request3);
    const wagonFactor3 = result3.reasons.find((r) => r.factor === 'wagonType');
    assert(wagonFactor3?.score === 0.7, 'Unspecified request type should score 0.7');
  });

  testSuite('Cargo Type Compatibility', () => {
    const offer1 = createMockOffer({ cargoType: 'COAL', wagonType: 'GONDOLA' });
    const request1 = createMockRequest({ cargoType: 'COAL', wagonType: 'GONDOLA' });
    const result1 = scoreMatch(offer1, request1);
    const cargoFactor1 = result1.reasons.find((r) => r.factor === 'cargoType');
    assert(cargoFactor1?.score === 1.0, 'Ideal cargo-wagon compatibility should score 1.0');

    const offer2 = createMockOffer({ cargoType: 'OIL', wagonType: 'GONDOLA' });
    const request2 = createMockRequest({ cargoType: 'OIL' });
    const result2 = scoreMatch(offer2, request2);
    const cargoFactor2 = result2.reasons.find((r) => r.factor === 'cargoType');
    assert(cargoFactor2?.score! < 0.5, 'Incompatible cargo-wagon should score < 0.5');

    const offer3 = createMockOffer({ cargoType: 'COAL', wagonType: 'HOPPER' });
    const request3 = createMockRequest({ cargoType: 'COAL' });
    const result3 = scoreMatch(offer3, request3);
    const cargoFactor3 = result3.reasons.find((r) => r.factor === 'cargoType');
    assert(cargoFactor3?.score! >= 0.8, 'Good cargo-wagon compatibility should score >= 0.8');
  });

  testSuite('Date Overlap', () => {
    const now = new Date();

    // Complete overlap
    const offer1 = createMockOffer({
      availableFrom: now,
      availableUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    });
    const request1 = createMockRequest({
      loadingDate: now,
      requiredByDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    });
    const result1 = scoreMatch(offer1, request1);
    const dateFactor1 = result1.reasons.find((r) => r.factor === 'dateOverlap');
    assert(dateFactor1?.score! >= 0.9, 'Complete date overlap should score >= 0.9');

    // No overlap
    const offer2 = createMockOffer({
      availableFrom: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
      availableUntil: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
    });
    const request2 = createMockRequest({
      loadingDate: now,
      requiredByDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    });
    const result2 = scoreMatch(offer2, request2);
    const dateFactor2 = result2.reasons.find((r) => r.factor === 'dateOverlap');
    assert(dateFactor2?.score === 0, 'No date overlap should score 0');

    // Partial overlap
    const offer3 = createMockOffer({
      availableFrom: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      availableUntil: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
    });
    const request3 = createMockRequest({
      loadingDate: now,
      requiredByDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    });
    const result3 = scoreMatch(offer3, request3);
    const dateFactor3 = result3.reasons.find((r) => r.factor === 'dateOverlap');
    assert(
      dateFactor3?.score! > 0.5 && dateFactor3?.score! < 1.0,
      'Partial date overlap should score between 0.5 and 1.0'
    );
  });

  testSuite('Price Matching', () => {
    const offer1 = createMockOffer({ pricePerWagon: 40000 });
    const request1 = createMockRequest({ maxPricePerWagon: 48000 });
    const result1 = scoreMatch(offer1, request1);
    const priceFactor1 = result1.reasons.find((r) => r.factor === 'priceMatch');
    assert(priceFactor1?.score === 1.0, 'Price below max should score 1.0');

    const offer2 = createMockOffer({ pricePerWagon: 55000 });
    const request2 = createMockRequest({ maxPricePerWagon: 48000 });
    const result2 = scoreMatch(offer2, request2);
    const priceFactor2 = result2.reasons.find((r) => r.factor === 'priceMatch');
    assert(priceFactor2?.score! > 0.5, 'Price within tolerance should score > 0.5');

    const offer3 = createMockOffer({ pricePerWagon: 70000 });
    const request3 = createMockRequest({ maxPricePerWagon: 40000 });
    const result3 = scoreMatch(offer3, request3);
    const priceFactor3 = result3.reasons.find((r) => r.factor === 'priceMatch');
    assert(priceFactor3?.score! < 0.5, 'Price exceeding tolerance should score < 0.5');

    const offer4 = createMockOffer({ pricePerWagon: 100000 });
    const request4 = createMockRequest({ maxPricePerWagon: null });
    const result4 = scoreMatch(offer4, request4);
    const priceFactor4 = result4.reasons.find((r) => r.factor === 'priceMatch');
    assert(priceFactor4?.score === 0.7, 'No max price specified should score 0.7');
  });

  testSuite('Regional Proximity', () => {
    const offer1 = createMockOffer({
      departureRegion: 'Кемеровская область',
      arrivalRegion: 'Новосибирская область',
    });
    const request1 = createMockRequest({
      departureRegion: 'Кемеровская область',
      arrivalRegion: 'Новосибирская область',
    });
    const result1 = scoreMatch(offer1, request1);
    const proximityFactor1 = result1.reasons.find((r) => r.factor === 'regionalProximity');
    assert(proximityFactor1?.score === 1.0, 'Identical routes should score 1.0');
  });

  testSuite('Overall Scoring', () => {
    const offer = createMockOffer();
    const request = createMockRequest();
    const result = scoreMatch(offer, request);

    assert(result.score >= 0, 'Score should be >= 0');
    assert(result.score <= 100, 'Score should be <= 100');
    assert(
      result.metadata.wagonTypeMatch >= 0 && result.metadata.wagonTypeMatch <= 1,
      'Metadata values should be 0-1'
    );
    assert(
      result.metadata.cargoTypeMatch >= 0 && result.metadata.cargoTypeMatch <= 1,
      'Metadata values should be 0-1'
    );
  });

  testSuite('Edge Cases', () => {
    const offer1 = createMockOffer({ description: null });
    const request1 = createMockRequest();
    const result1 = scoreMatch(offer1, request1);
    assert(result1.score > 0, 'Should handle null description');

    const now = new Date();
    const offer2 = createMockOffer({
      availableFrom: now,
      availableUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });
    const request2 = createMockRequest({
      loadingDate: now,
      requiredByDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });
    const result2 = scoreMatch(offer2, request2);
    assert(result2.score >= 0 && result2.score <= 100, 'Should handle same-day dates');
  });

  // Results
  console.log(`\n${'='.repeat(50)}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Total: ${passedTests + failedTests}`);
  console.log(`${'='.repeat(50)}\n`);

  process.exit(failedTests > 0 ? 1 : 0);
}

runTests();
