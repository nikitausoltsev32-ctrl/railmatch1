import { ReactNode } from 'react';
import { copy } from '@/lib/i18n/ru';

export default function SeekerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-neutral-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-primary-600">Seeker Panel</h2>
        </div>
        <nav className="px-4 pb-6">
          <ul className="space-y-2">
            <li>
              <a
                href="/seeker/browse"
                className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                {copy.seeker.navigation.browse}
              </a>
            </li>
            <li>
              <a
                href="/seeker/requests"
                className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                {copy.seeker.navigation.requests}
              </a>
            </li>
            <li>
              <a
                href="/seeker/inbox"
                className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                {copy.seeker.navigation.inbox}
              </a>
            </li>
            <li>
              <a
                href="/seeker/matches"
                className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                {copy.seeker.navigation.matches}
              </a>
            </li>
            <li>
              <a
                href="/seeker/chat"
                className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                {copy.seeker.navigation.chat}
              </a>
            </li>
            <li>
              <a
                href="/seeker/profile"
                className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                {copy.seeker.navigation.profile}
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container-custom py-8">
          {children}
        </div>
      </main>
    </div>
  );
}