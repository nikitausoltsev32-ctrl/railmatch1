import { copy } from '@/lib/i18n/ru';
import { getOperatorResponses } from '@/lib/actions/responses';
import { prisma } from '@/lib/prisma';
import { ResponsesContent } from '@/components/responses/ResponsesContent';

// Mock operator company ID - in real app this would come from authentication
const mockOperatorCompanyId = 1; // From seed data

export default async function OperatorResponsesPage() {
  // Fetch responses data
  const responses = await getOperatorResponses(mockOperatorCompanyId);
  
  // Get company info for context
  const company = await prisma.company.findUnique({
    where: { id: mockOperatorCompanyId },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          {copy.operator.responses.title}
        </h1>
        <p className="text-neutral-600 mt-1">
          {copy.operator.responses.subtitle}
        </p>
      </div>

      <ResponsesContent 
        initialResponses={responses}
        companyType="operator"
        companyId={mockOperatorCompanyId}
      />
    </div>
  );
}