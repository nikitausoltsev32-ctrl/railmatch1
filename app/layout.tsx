import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'RailMatch - Система логистики',
  description: 'Передовая платформа для управления железнодорожной логистикой',
  keywords: ['логистика', 'железная дорога', 'управление', 'транспорт'],
  authors: [{ name: 'RailMatch' }],
  openGraph: {
    title: 'RailMatch - Система логистики',
    description: 'Передовая платформа для управления железнодорожной логистикой',
    url: 'https://railmatch.local',
    type: 'website',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <header className="border-b border-neutral-200 bg-white">
            <div className="container-custom flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary-600">RailMatch</span>
              </div>
              <nav className="hidden gap-8 md:flex">
                <a
                  href="#"
                  className="text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  Главная
                </a>
                <a
                  href="#"
                  className="text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  О платформе
                </a>
                <a
                  href="#"
                  className="text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  Контакты
                </a>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-neutral-200 bg-neutral-50">
            <div className="container-custom py-8">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-neutral-600">
                  © 2024 RailMatch. Все права защищены.
                </p>
                <div className="flex gap-6">
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    Политика конфиденциальности
                  </a>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    Условия использования
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
