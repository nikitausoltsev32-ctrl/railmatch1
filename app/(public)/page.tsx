import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { copy } from '@/lib/i18n/ru';

export default function Home() {
  return (
    <div className="container-custom">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h1 className="text-5xl font-bold md:text-6xl">
            {copy.hero.title}
          </h1>
          <p className="text-xl text-neutral-600">
            {copy.hero.subtitle}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button>{copy.cta.primary}</Button>
            <Button variant="outline">{copy.cta.secondary}</Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center">
            <h2>{copy.features.title}</h2>
            <p className="mt-4 text-neutral-600">
              {copy.features.subtitle}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {copy.features.items.map((item, index) => (
              <Card key={index}>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-neutral-600">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="space-y-6 text-center">
            <h2 className="text-white">{copy.ctaSection.title}</h2>
            <p className="text-lg text-primary-100">
              {copy.ctaSection.description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="white">{copy.cta.getStarted}</Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
