# RailMatch - Matching Service Documentation

## Overview

The Matching Service is a configurable algorithm system that computes compatibility scores between transportation offers (from operators) and requests (from seekers). Scores range from 0-100, with detailed breakdowns of factors influencing each match.

## Architecture

### Components

1. **Configuration** (`config/matching.ts`)
   - Adjustable weights for each scoring factor
   - Regional proximity matrix
   - Cargo-wagon compatibility mappings
   - Price tolerance settings
   - Threshold configurations

2. **Scoring Algorithm** (`lib/matching.ts`)
   - Core `scoreMatch()` function
   - Five scoring factors with detailed reasoning
   - Returns structured result with explanations in Russian

3. **API Route** (`app/api/match/route.ts`)
   - GET `/api/match?requestId=<id>`
   - Returns sorted matches with full details
   - Automatically stores Match records in database
   - User authentication and authorization (TODO)

4. **UI Components** (`components/matches/`)
   - `MatchCard.tsx` - Individual match display
   - `ScoreGauge.tsx` - Visual score representation
   - `ScoreFactors.tsx` - Collapsible factor breakdown
   - `MatchesContent.tsx` - Main page controller

5. **Matches Page** (`app/seeker/matches/`)
   - `/seeker/matches` route
   - Request selector with automatic match loading
   - Responsive match card grid

6. **Background Job** (`scripts/recompute-matches.ts`)
   - Recomputes all matches or specific requests
   - Can be run on-demand or scheduled
   - Supports batching for large datasets

## Scoring Factors

### 1. Wagon Type (25% weight)
- **Perfect match**: Offer and request specify same wagon type → 1.0
- **Mismatch**: Different types → 0.6
- **Flexible request**: Request doesn't specify type → 0.7

### 2. Cargo Type Compatibility (25% weight)
Uses predefined matrix mapping each cargo type to wagon type compatibility:
- **COAL**: Best in GONDOLA (1.0), good in HOPPER (0.9)
- **OIL**: Must use TANK (1.0), poor elsewhere
- **GRAIN**: Best in HOPPER (1.0), good in GONDOLA (0.8)
- **METAL**: Best on PLATFORM (1.0), good on FLATCAR (0.95)
- **CHEMICAL**: Tank preferred (0.95), BOXCAR acceptable (0.8)
- Other mappings in `config/matching.ts`

### 3. Date Overlap (15% weight)
- **No overlap**: → 0
- **Good overlap**: 90%+ of request date range covered → 0.9-1.0
- **Partial overlap**: 50-90% coverage → 0.4-0.7
- **Minimal overlap**: < 50% → 0.3-0.4

### 4. Regional Proximity (15% weight)
- **Identical route**: Same departure and arrival regions → 1.0
- **Partial match**: One region matches → 0.6-0.9
- **Proximity-based**: Uses predefined region pairs (e.g., Siberian regions close to each other) → 0.4-0.95
- **Unknown**: Default to 0.4

### 5. Price Match (20% weight)
- **Below max**: Offer price ≤ request max price → 1.0
- **Within tolerance**: Exceeds max but within 15% → Scales 0.5-1.0
- **Beyond tolerance**: Exceeds by > 15% → Scales 0.2-0.5
- **No max specified**: Neutral score → 0.7

## Configuration

### Adjusting Weights

Edit `config/matching.ts` to change factor importance:

```typescript
export const matchingConfig = {
  weights: {
    wagonType: 0.25,      // Change these values
    cargoType: 0.25,
    dateOverlap: 0.15,
    regionalProximity: 0.15,
    priceMatch: 0.2,      // Must sum to 1.0
  },
  // ... other config
};
```

### Adding Regional Proximity Pairs

```typescript
regionalProximity: {
  'Регион1, Регион2': 0.85,  // Score for this route combination
  // Add more pairs as needed
},
```

### Cargo-Wagon Compatibility

Add or modify entries in the `cargoWagonCompatibility` matrix:

```typescript
NEWCARGO: {
  GONDOLA: 0.9,
  HOPPER: 0.7,
  // etc.
},
```

### Threshold & Tolerance

```typescript
minScoreThreshold: 0.5,          // Only return matches ≥ 50/100
priceTolerancePercentage: 15,    // Accept up to 15% over max price
minDateOverlapDays: 1,           // Minimum overlap required
```

## API Usage

### GET /api/match

Request a list of scored offers for a seeker's request.

**Query Parameters:**
- `requestId` (required, number): The request ID to find matches for

**Response:**
```json
{
  "success": true,
  "requestId": 1,
  "requestDetails": {
    "cargoType": "METAL",
    "departureRegion": "Свердловская область",
    "arrivalRegion": "Московская область"
  },
  "matches": [
    {
      "id": 1,
      "offerId": 2,
      "score": 95,
      "offer": {
        "id": 2,
        "wagonType": "PLATFORM",
        "cargoType": "METAL",
        "wagonCount": 30,
        "departureStation": "Екатеринбург",
        "departureRegion": "Свердловская область",
        "arrivalStation": "Москва",
        "arrivalRegion": "Московская область",
        "availableFrom": "2024-12-01T00:00:00Z",
        "availableUntil": "2024-12-25T00:00:00Z",
        "pricePerWagon": 52000,
        "description": "Платформы для металлопроката"
      },
      "company": {
        "id": 1,
        "name": "ЖД Логистика",
        "description": "Крупнейший оператор"
      },
      "reasons": [
        {
          "factor": "wagonType",
          "label": "Тип вагона",
          "score": 1.0,
          "weight": 0.25,
          "explanation": "Тип вагона совпадает: PLATFORM"
        },
        // More factors...
      ],
      "metadata": {
        "wagonTypeMatch": 1.0,
        "cargoTypeMatch": 1.0,
        "dateOverlap": 0.95,
        "regionalProximity": 1.0,
        "priceMatch": 0.92
      }
    }
    // More matches...
  ],
  "count": 3
}
```

## Testing

### Running Tests

```bash
npm test lib/__tests__/matching.test.ts
```

### Test Coverage

The test suite covers:
- Perfect matches (high scores)
- Wagon type matching logic
- Cargo type compatibility matrix
- Date overlap calculations
- Price matching with tolerance
- Regional proximity scoring
- Edge cases (no description, same-day dates, long windows)
- Score range validation (0-100)
- Weighted score calculation

### Adding Tests

Tests are in `lib/__tests__/matching.test.ts`. Add new test cases for:
- New cargo types
- Updated region pairs
- Changed weight configurations
- New edge cases

## Background Jobs

### Recompute Matches

Run the background job to update all match scores:

```bash
# Basic run
npm run recompute-matches

# Verbose output
npm run recompute-matches:verbose

# Or directly with tsx
npx tsx scripts/recompute-matches.ts --verbose
```

### When to Run

- After creating a new offer
- After updating an offer
- After creating a new request
- After updating a request
- Scheduled periodic recomputation (e.g., hourly)
- When updating matching configuration

### Integration with Events

For production, integrate with your job queue:

```typescript
// Example: Trigger on offer creation
import { recomputeMatches } from '@/scripts/recompute-matches';

export async function createOffer(data) {
  const offer = await prisma.offer.create({ data });
  
  // Queue async job
  await jobQueue.enqueue('recompute-matches', { verbose: false });
  
  return offer;
}
```

## UI Components

### MatchCard
Displays a single match with:
- Score gauge (visual)
- Cargo/wagon type badges
- Company info
- Detailed offer information
- Expandable factor breakdown
- Action buttons

### ScoreGauge
Visual circular gauge showing:
- Score 0-100
- Color-coded: Red (0-40), Orange (40-60), Yellow (60-80), Green (80-100)
- Responsive sizing (sm, md, lg)

### ScoreFactors
Expandable accordion showing:
- Each factor's contribution
- Individual score with progress bar
- Weight percentage
- Russian explanation

### MatchesContent
Main controller component handling:
- Request selection
- API call triggering
- Error handling
- Loading states
- Empty states
- Match list rendering

## Error Handling

### Authorization (TODO)
- Verify user is authenticated
- Verify user is a seeker
- Verify user owns the request

### Validation
- Request ID must be a valid number
- Request must exist
- Request must belong to user's company

### Error Responses

```json
{
  "error": "requestId parameter is required"
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Missing/invalid parameters
- `403`: Unauthorized (wrong company)
- `404`: Request not found
- `500`: Server error

## Performance Considerations

### Query Optimization
- Indexes on `Offer.isArchived`, `Offer.wagonType`, `Request.companyId`
- Batch operations for background jobs
- Use pagination in UI (matches sorted by score)

### Caching
- Match scores stored in database
- Recomputation on-demand or scheduled
- Could add Redis caching layer for frequently accessed matches

### Scaling
- Background jobs: Use queue system (Bull, RabbitMQ)
- API: Add rate limiting
- Database: Consider sharding by company for large datasets

## Future Enhancements

1. **ML-based Scoring**: Replace rule-based algorithm with trained model
2. **Historical Data**: Track score changes over time
3. **User Feedback**: Train from user acceptance/rejection
4. **Seasonal Adjustments**: Weight factors based on time of year
5. **Custom Matching Rules**: Per-company or per-region rules
6. **Match Notifications**: Alert seekers of new matches
7. **Match Expiry**: Expire old matches after N days
8. **Favorite Matching**: Prioritize offers from favorite operators
9. **A/B Testing**: Test different weight configurations
10. **Analytics**: Track match acceptance rates by factor

## Database Schema

### Match Table
- `id`: Unique identifier
- `offerId`: Reference to Offer
- `requestId`: Reference to Request
- `score`: Match score (0-1 scale, stored as float)
- `status`: PENDING, ACCEPTED, REJECTED, EXPIRED
- `metadata`: JSON with reasons and computed metadata
- Indexes on `status`, `score`, and the unique pair `(offerId, requestId)`

### Indexes
```sql
CREATE UNIQUE INDEX match_offer_request ON match(offerId, requestId);
CREATE INDEX match_status_score ON match(status, score);
```

## Troubleshooting

### Matches Not Appearing
1. Check if request exists in database
2. Verify seeker company ID is correct (currently hardcoded)
3. Run `npm run recompute-matches:verbose` to see scoring details
4. Check browser console for API errors

### Low Scores
1. Review regional proximity configuration
2. Check cargo-wagon compatibility matrix
3. Verify price tolerance matches business rules
4. Run test suite to validate algorithm

### Performance Issues
1. Check database query plans for O(n²) complexity
2. Consider batch processing for large datasets
3. Add caching layer if needed
4. Profile with verbose logging enabled

## Related Documentation

- [Prisma Schema](prisma/schema.prisma) - Database models
- [Config](config/matching.ts) - Scoring configuration
- [Matching Lib](lib/matching.ts) - Algorithm implementation
- [API Route](app/api/match/route.ts) - REST endpoint
- [Components](components/matches/) - UI components
- [Tests](lib/__tests__/matching.test.ts) - Test cases
