import {
  BadgeCheck,
  Banknote,
  Globe2,
  Headset,
  LockKeyhole,
  ShieldCheck
} from 'lucide-react';
import { content, trustCards } from '../lib/content';

const iconMap = {
  shield: ShieldCheck,
  lock: LockKeyhole,
  headset: Headset,
  globe: Globe2,
  banknote: Banknote,
  check: BadgeCheck
} as const;

export function TrustInstitutional({ locale }: { locale: keyof typeof content }) {
  const t = content[locale];
  const cards = trustCards[locale];
  const fa = locale === 'fa';

  return (
    <section className="section-band bg-[#fcfbf8]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{fa ? 'اعتماد نهادی' : 'Institutional trust'}</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{t.trustSectionTitle}</h2>
          <p className="mt-4 text-base leading-8 text-[#5f6b78]">{t.trustSectionCopy}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = iconMap[card.icon];
            return (
              <article key={card.title} className="trust-card">
                <div className="trust-card__icon">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f6b78]">{card.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
