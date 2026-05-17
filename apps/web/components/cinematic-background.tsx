'use client';

import Image from 'next/image';
import { visualAssets } from '../lib/visual-assets';

type Variant = 'hero' | 'corridor' | 'office' | 'rates' | 'footer';

type CinematicBackgroundProps = {
  variant: Variant;
  scene?: 'muscat' | 'global' | 'dubai' | 'istanbul';
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const sceneSources: Record<string, { desktop: string; mobile: string; webp?: string; mobileWebp?: string }> = {
  muscat: {
    desktop: visualAssets.hero.muscat.desktop,
    mobile: visualAssets.hero.muscat.mobile,
    webp: visualAssets.hero.muscat.desktopWebp,
    mobileWebp: visualAssets.hero.muscat.mobileWebp
  },
  global: {
    desktop: visualAssets.hero.global.desktop,
    mobile: visualAssets.hero.global.mobile,
    webp: visualAssets.hero.global.desktopWebp,
    mobileWebp: visualAssets.hero.global.mobileWebp
  },
  dubai: {
    desktop: visualAssets.corridors.dubai.desktop,
    mobile: visualAssets.corridors.dubai.mobile,
    webp: visualAssets.corridors.dubai.webp,
    mobileWebp: visualAssets.corridors.dubai.mobileWebp
  },
  istanbul: {
    desktop: visualAssets.corridors.istanbul.desktop,
    mobile: visualAssets.corridors.istanbul.mobile,
    webp: visualAssets.corridors.istanbul.webp,
    mobileWebp: visualAssets.corridors.istanbul.mobileWebp
  },
  office: {
    desktop: visualAssets.offices.consultation,
    mobile: visualAssets.offices.consultation,
    webp: visualAssets.offices.consultationWebp,
    mobileWebp: visualAssets.offices.consultationWebp
  },
  rates: {
    desktop: visualAssets.liveRates.terminal,
    mobile: visualAssets.liveRates.terminal,
    webp: visualAssets.liveRates.terminalWebp,
    mobileWebp: visualAssets.liveRates.terminalWebp
  },
  footer: {
    desktop: visualAssets.footer.institutional,
    mobile: visualAssets.footer.institutional,
    webp: visualAssets.footer.institutionalWebp,
    mobileWebp: visualAssets.footer.institutionalWebp
  }
};

function resolveScene(variant: Variant, scene?: string) {
  if (variant === 'corridor' && scene) return sceneSources[scene] ?? sceneSources.muscat;
  if (variant === 'hero') return sceneSources[scene === 'global' ? 'global' : 'muscat'];
  if (variant === 'office') return sceneSources.office;
  if (variant === 'rates') return sceneSources.rates;
  if (variant === 'footer') return sceneSources.footer;
  return sceneSources.muscat;
}

export function CinematicBackground({
  variant,
  scene = 'muscat',
  priority = false,
  className = '',
  children
}: CinematicBackgroundProps) {
  const sources = resolveScene(variant, scene);

  return (
    <div className={`cinematic-bg ${className}`} data-variant={variant}>
      <picture className="cinematic-bg__picture">
        {sources.mobileWebp ? <source type="image/webp" media="(max-width: 767px)" srcSet={sources.mobileWebp} /> : null}
        {sources.webp ? <source type="image/webp" media="(min-width: 768px)" srcSet={sources.webp} /> : null}
        <source media="(max-width: 767px)" srcSet={sources.mobile} />
        <img
          src={sources.desktop}
          alt=""
          className="cinematic-bg__img"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </picture>
      <CinematicOverlays variant={variant} />
      {children ? <div>{children}</div> : null}
    </div>
  );
}

function CinematicOverlays({ variant }: { variant: Variant }) {
  return (
    <>
      <div className="cinematic-bg__gradient" aria-hidden />
      <img
        src={visualAssets.overlays.navyGradient}
        alt=""
        className="cinematic-bg__overlay cinematic-bg__overlay--gradient"
        aria-hidden
      />
      {(variant === 'hero' || variant === 'corridor') && (
        <>
          <img
            src={visualAssets.overlays.worldRoutes}
            alt=""
            className="cinematic-bg__overlay cinematic-bg__overlay--map route-drift"
            aria-hidden
          />
          <img
            src={visualAssets.overlays.heroGrid}
            alt=""
            className="cinematic-bg__overlay cinematic-bg__overlay--grid"
            aria-hidden
          />
        </>
      )}
      {variant === 'rates' ? (
        <img
          src={visualAssets.liveRates.particles}
          alt=""
          className="cinematic-bg__overlay cinematic-bg__overlay--particles particle-field"
          aria-hidden
        />
      ) : null}
      <div className="cinematic-bg__vignette" aria-hidden />
    </>
  );
}

export function CinematicHeroImage({
  scene = 'muscat',
  className = '',
  priority = true
}: {
  scene?: 'muscat' | 'office';
  className?: string;
  priority?: boolean;
}) {
  const src =
    scene === 'office' ? visualAssets.offices.consultation : visualAssets.hero.muscat.desktop;
  const alt =
    scene === 'office'
      ? 'فضای مشاوره حرفه‌ای اومانی'
      : 'اومانی — صرافی بین‌المللی در مسقط';

  return (
    <div className={`cinematic-frame ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="(min-width: 1024px) 640px, 100vw" priority={priority} />
      <div className="cinematic-frame__shade" aria-hidden />
    </div>
  );
}
