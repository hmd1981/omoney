'use client';

import Link from 'next/link';
import { CircleCheckBig } from 'lucide-react';
import { content } from '../lib/content';
import { HeroCinematicLayer } from './hero-cinematic-layer';
import { CinematicHeroImage } from './cinematic-background';
import { HomepageMarketPanel } from './homepage-market-panel';
import type { MediaPlacementMap } from '../lib/media';

const whatsappHref = 'https://wa.me/message/NBV22R27A46TB1';

export function PremiumHero({
  locale,
  media
}: {
  locale: keyof typeof content;
  media: MediaPlacementMap;
}) {
  const t = content[locale];
  const fa = locale === 'fa';

  return (
    <section className="hero-premium">
      <HeroCinematicLayer media={media.HOME_HERO} eager />
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="hero-premium__bg" />
        <div className="hero-premium__grid" />
        <div className="hero-premium__orb hero-premium__orb--gold" />
        <div className="hero-premium__orb hero-premium__orb--blue" />
        <HeroFlowLines />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:pb-20 lg:pt-20">
        <div>
          <div className="fade-up flex flex-wrap gap-2">
            {t.heroCities.map((city, index) => (
              <span
                key={city}
                className="hero-city-pill float-slow"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {city}
              </span>
            ))}
          </div>
          <p className="eyebrow fade-up-delay-1 mt-6 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">{t.heroKicker}</p>
          <h1 className="fade-up-delay-1 mt-5 max-w-3xl text-4xl font-semibold leading-[1.12] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.55)] md:text-5xl lg:text-[3.25rem]">
            {t.heroTitle}
          </h1>
          <p className="fade-up-delay-2 mt-5 max-w-2xl text-lg font-medium leading-relaxed text-[#dec58d] drop-shadow-[0_3px_16px_rgba(0,0,0,0.5)]">
            {t.heroSubtitle}
          </p>
          <p className="fade-up-delay-2 mt-4 max-w-2xl text-base leading-8 text-white/90 drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]">{t.heroCopy}</p>

          <div className="fade-up-delay-2 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${locale}/register`} className="btn-primary">
              {t.primaryCta}
            </Link>
            <a href={whatsappHref} className="btn-ghost">
              {t.secondaryCta}
            </a>
          </div>

          <div className="fade-up-delay-2 mt-10 grid gap-3 sm:grid-cols-3">
            {t.trustItems.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-white/75">
                <CircleCheckBig size={17} className="mt-0.5 shrink-0 text-[#dec58d]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <figure className="fade-up-delay-2 mt-10 overflow-hidden rounded-xl border border-white/12 shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
            <CinematicHeroImage scene="office" className="aspect-[16/9] min-h-[220px]" priority={false} />
            <figcaption className="border-t border-white/10 bg-black/40 px-4 py-3 text-xs text-white/65">
              {fa
                ? 'اومانی — صرافی عمان با پوشش مسقط، دبی و استانبول'
                : 'OMoney — Oman exchange with Muscat, Dubai, and Istanbul coverage'}
            </figcaption>
          </figure>
        </div>

        <div className="fade-up-delay-2 lg:pt-4">
          <HomepageMarketPanel locale={locale} />
        </div>
      </div>
    </section>
  );
}

function HeroFlowLines() {
  return (
    <svg className="hero-premium__flow h-full w-full" viewBox="0 0 1200 800" fill="none" aria-hidden>
      <path
        d="M0 420 Q300 380 500 400 T900 360 T1200 320"
        stroke="url(#flowGold)"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        fill="none"
      />
      <path
        d="M0 520 Q400 480 650 500 T1100 440"
        stroke="url(#flowGold)"
        strokeWidth="0.8"
        strokeOpacity="0.2"
        fill="none"
      />
      <defs>
        <linearGradient id="flowGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dec58d" stopOpacity="0" />
          <stop offset="50%" stopColor="#c7a15b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#dec58d" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
