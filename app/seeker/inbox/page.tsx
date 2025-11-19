import { copy } from '@/lib/i18n/ru';
import { getSeekerInbox } from '@/lib/actions/responses';
import { prisma } from '@/lib/prisma';
import { ResponsesContent } from '@/components/responses/ResponsesContent';

// Mock seeker company ID - in real app this would come from authentication
const mockSeekerCompanyId = 2; // From seed data

export default async function SeekerInboxPage() {
  // Fetch inbox data
  const inbox = await getSeekerInbox(mockSeekerCompanyId);
  
  // Get company info for context
  const company = await prisma.company.findUnique({
    where: { id: mockSeekerCompanyId },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          {copy.seeker.inbox.title}
        </h1>
        <p className="text-neutral-600 mt-1">
          {copy.seeker.inbox.subtitle}
        </p>
      </div>

      <ResponsesContent 
        initialResponses={inbox}
        companyType="seeker"
        companyId={mockSeekerCompanyId}
      />
    </div>
  );
}