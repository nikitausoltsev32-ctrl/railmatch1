/**
 * Matching Service Configuration
 * Defines weights and thresholds for the scoring algorithm
 */

export const matchingConfig = {
  // Weight configuration for each factor (0-1 scale, should sum to 1.0)
  weights: {
    wagonType: 0.25,
    cargoType: 0.25,
    dateOverlap: 0.15,
    regionalProximity: 0.15,
    priceMatch: 0.2,
  },

  // Regional proximity scoring
  // Maps region pairs to proximity scores (0-1 scale)
  regionalProximity: {
    // Siberia-Siberia combinations (high proximity)
    ['Кемеровская область, Новосибирская область']: 0.95,
    ['Новосибирская область, Кемеровская область']: 0.95,
    ['Свердловская область, Тюменская область']: 0.9,
    ['Тюменская область, Свердловская область']: 0.9,
    
    // Urals-Urals combinations
    ['Свердловская область, Свердловская область']: 1.0,
    ['Пермский край, Свердловская область']: 0.85,
    ['Свердловская область, Пермский край']: 0.85,
    
    // European Russia combinations
    ['Московская область, Московская область']: 1.0,
    ['Ленинградская область, Ленинградская область']: 1.0,
    ['Московская область, Ленинградская область']: 0.8,
    ['Ленинградская область, Московская область']: 0.8,
    ['Московская область, Тверская область']: 0.9,
    ['Тверская область, Московская область']: 0.9,
    
    // Samara region
    ['Самарская область, Ленинградская область']: 0.7,
    ['Ленинградская область, Самарская область']: 0.7,
    
    // Omsk region
    ['Омская область, Республика Татарстан']: 0.75,
    ['Республика Татарстан, Омская область']: 0.75,
  } as Record<string, number>,

  // Cargo to wagon type compatibility mapping
  // Higher score = better compatibility
  cargoWagonCompatibility: {
    COAL: {
      GONDOLA: 1.0,
      HOPPER: 0.9,
      BOXCAR: 0.7,
      PLATFORM: 0.3,
      TANK: 0.0,
      FLATCAR: 0.5,
      REFRIGERATOR: 0.0,
    },
    OIL: {
      TANK: 1.0,
      BOXCAR: 0.6,
      HOPPER: 0.2,
      GONDOLA: 0.1,
      PLATFORM: 0.0,
      FLATCAR: 0.0,
      REFRIGERATOR: 0.0,
    },
    GRAIN: {
      HOPPER: 1.0,
      GONDOLA: 0.8,
      BOXCAR: 0.7,
      TANK: 0.0,
      PLATFORM: 0.2,
      FLATCAR: 0.2,
      REFRIGERATOR: 0.3,
    },
    METAL: {
      PLATFORM: 1.0,
      FLATCAR: 0.95,
      GONDOLA: 0.8,
      BOXCAR: 0.6,
      HOPPER: 0.2,
      TANK: 0.0,
      REFRIGERATOR: 0.0,
    },
    CHEMICAL: {
      TANK: 0.95,
      BOXCAR: 0.8,
      PLATFORM: 0.3,
      FLATCAR: 0.3,
      GONDOLA: 0.1,
      HOPPER: 0.0,
      REFRIGERATOR: 0.5,
    },
    TIMBER: {
      PLATFORM: 1.0,
      FLATCAR: 0.95,
      GONDOLA: 0.7,
      BOXCAR: 0.8,
      HOPPER: 0.2,
      TANK: 0.0,
      REFRIGERATOR: 0.0,
    },
    CONTAINER: {
      PLATFORM: 1.0,
      FLATCAR: 0.95,
      BOXCAR: 0.8,
      GONDOLA: 0.5,
      HOPPER: 0.1,
      TANK: 0.0,
      REFRIGERATOR: 0.0,
    },
    BULK: {
      GONDOLA: 0.9,
      HOPPER: 0.95,
      BOXCAR: 0.7,
      PLATFORM: 0.4,
      FLATCAR: 0.4,
      TANK: 0.0,
      REFRIGERATOR: 0.0,
    },
    OTHER: {
      BOXCAR: 0.8,
      GONDOLA: 0.6,
      PLATFORM: 0.6,
      FLATCAR: 0.6,
      HOPPER: 0.4,
      TANK: 0.3,
      REFRIGERATOR: 0.4,
    },
  } as Record<string, Record<string, number>>,

  // Price tolerance configuration
  priceTolerancePercentage: 15, // Accept offers up to 15% more than max price
  minScoreThreshold: 0.5, // Minimum score to include in results

  // Date overlap requirements (in days)
  minDateOverlapDays: 1, // Minimum overlap between availability and required dates
};

export type MatchingConfig = typeof matchingConfig;
