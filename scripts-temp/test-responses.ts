import { getOperatorResponses, getSeekerInbox, updateDealStatus } from '../lib/actions/responses';
import { prisma } from '../lib/prisma';

async function testResponsesImplementation() {
  console.log('🧪 Testing responses implementation...');
  
  try {
    // Test operator responses
    console.log('\n📊 Testing operator responses...');
    const operatorResponses = await getOperatorResponses(1); // Operator company ID from seed
    
    console.log(`Found ${operatorResponses.length} responses for operator`);
    operatorResponses.forEach((response, index) => {
      console.log(`Response ${index + 1}:`);
      console.log(`  - Match ID: ${response.id}`);
      console.log(`  - Current Status: ${response.currentStatus}`);
      console.log(`  - Score: ${response.score}`);
      console.log(`  - Offer Company: ${response.offer.company.name}`);
      console.log(`  - Request Company: ${response.request.company.name}`);
      console.log(`  - Last Message: ${response.lastMessage?.content || 'None'}`);
    });
    
    // Test seeker inbox
    console.log('\n📥 Testing seeker inbox...');
    const seekerInbox = await getSeekerInbox(2); // Seeker company ID from seed
    
    console.log(`Found ${seekerInbox.length} items in seeker inbox`);
    seekerInbox.forEach((item, index) => {
      console.log(`Inbox Item ${index + 1}:`);
      console.log(`  - Match ID: ${item.id}`);
      console.log(`  - Current Status: ${item.currentStatus}`);
      console.log(`  - Score: ${item.score}`);
      console.log(`  - Offer Company: ${item.offer.company.name}`);
      console.log(`  - Request Company: ${item.request.company.name}`);
    });
    
    // Test status update
    if (operatorResponses.length > 0) {
      console.log('\n🔄 Testing status update...');
      const testResponse = operatorResponses[0];
      if (!testResponse) {
        console.log('No test response found');
        return;
      }
      
      const originalStatus = testResponse.currentStatus;
      
      if (originalStatus === 'PENDING') {
        console.log('Testing PENDING -> NEGOTIATING transition...');
        await updateDealStatus({
          matchId: testResponse.id,
          newStatus: 'NEGOTIATING',
          comment: 'Test status transition',
          userId: 1,
        });
        
        // Verify update
        const updated = await prisma.match.findUnique({
          where: { id: testResponse.id },
          include: { dealStatusHistories: true },
        });
        
        const latestHistory = updated?.dealStatusHistories
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        
        console.log(`Status updated successfully: ${latestHistory?.status === 'NEGOTIATING' ? '✅' : '❌'}`);
        
        // Test NEGOTIATING -> ACCEPTED
        console.log('Testing NEGOTIATING -> ACCEPTED transition...');
        await updateDealStatus({
          matchId: testResponse.id,
          newStatus: 'ACCEPTED',
          comment: 'Test accepting deal',
          userId: 1,
        });
        
        // Reset back to original
        await updateDealStatus({
          matchId: testResponse.id,
          newStatus: originalStatus,
          comment: 'Reset test',
          userId: 1,
        });
      }
    }
    
    console.log('\n✅ Responses implementation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

testResponsesImplementation();