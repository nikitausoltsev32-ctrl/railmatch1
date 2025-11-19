import { validTransitions } from '../lib/actions/responses';
import { DealStatus } from '@prisma/client';

// Test status transition validation
function testStatusTransitions() {
  console.log('Testing status transition validation...');
  
  // Test valid transitions
  const validTests = [
    { from: 'PENDING', to: 'NEGOTIATING' },
    { from: 'PENDING', to: 'ACCEPTED' },
    { from: 'PENDING', to: 'REJECTED' },
    { from: 'NEGOTIATING', to: 'ACCEPTED' },
    { from: 'NEGOTIATING', to: 'REJECTED' },
    { from: 'NEGOTIATING', to: 'COMPLETED' },
    { from: 'NEGOTIATING', to: 'CANCELLED' },
    { from: 'ACCEPTED', to: 'COMPLETED' },
    { from: 'ACCEPTED', to: 'CANCELLED' },
  ];
  
  // Test invalid transitions
  const invalidTests = [
    { from: 'REJECTED', to: 'NEGOTIATING' },
    { from: 'COMPLETED', to: 'NEGOTIATING' },
    { from: 'CANCELLED', to: 'ACCEPTED' },
    { from: 'PENDING', to: 'COMPLETED' },
  ];
  
  console.log('\nValid transitions:');
  validTests.forEach(({ from, to }) => {
    const allowed = validTransitions[from as DealStatus]?.includes(to as DealStatus);
    console.log(`${from} -> ${to}: ${allowed ? '✅' : '❌'}`);
  });
  
  console.log('\nInvalid transitions:');
  invalidTests.forEach(({ from, to }) => {
    const allowed = validTransitions[from as DealStatus]?.includes(to as DealStatus);
    console.log(`${from} -> ${to}: ${allowed ? '❌ Should be invalid' : '✅ Correctly rejected'}`);
  });
  
  console.log('\nStatus transition tests completed!');
}

testStatusTransitions();