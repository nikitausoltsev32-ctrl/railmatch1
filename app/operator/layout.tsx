import { ReactNode } from 'react';
import { copy } from '@/lib/i18n/ru';

export default function OperatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900">Оператор</h2>
        </div>
        <nav className="px-4 pb-6">
          <ul className="space-y-1">
            <li>
              <a
                href="/operator/offers"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-primary-600 bg-primary-50"
              >
                {copy.operator.navigation.offers}
              </a>
            </li>
            <li>
              <a
                href="/operator/responses"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              >
                {copy.operator.navigation.responses}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              >
                {copy.operator.navigation.matching}
              </a>
            </li>
            <li>
              <a
                href="/operator/chat"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              >
                {copy.operator.navigation.chat}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              >
                {copy.operator.navigation.analytics}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              >
                {copy.operator.navigation.settings}
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}