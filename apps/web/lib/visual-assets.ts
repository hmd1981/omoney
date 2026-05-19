/**
 * OMoney (اومانی) — Cinematic visual asset registry
 * Static fallbacks when CMS media placements are empty.
 */

export const visualAssets = {
  hero: {
    muscat: {
      desktop: '/images/hero/muscat-desktop.jpg',
      mobile: '/images/hero/muscat-mobile.jpg',
      ultrawide: '/images/hero/muscat-ultrawide.jpg',
      desktopWebp: '/images/hero/muscat-desktop.webp',
      mobileWebp: '/images/hero/muscat-mobile.webp',
      ultrawideWebp: '/images/hero/muscat-ultrawide.webp',
      overlay: '/images/overlays/hero-navy-gold.svg',
      map: '/images/overlays/world-routes.svg'
    },
    global: {
      desktop: '/images/hero/global-transfer-desktop.jpg',
      mobile: '/images/hero/global-transfer-mobile.jpg',
      desktopWebp: '/images/hero/global-transfer-desktop.webp',
      mobileWebp: '/images/hero/global-transfer-mobile.webp'
    }
  },
  corridors: {
    muscat: {
      desktop: '/images/corridors/muscat-desktop.jpg',
      mobile: '/images/corridors/muscat-mobile.jpg',
      webp: '/images/corridors/muscat-desktop.webp',
      mobileWebp: '/images/corridors/muscat-mobile.webp'
    },
    dubai: {
      desktop: '/images/corridors/dubai-desktop.jpg',
      mobile: '/images/corridors/dubai-mobile.jpg',
      webp: '/images/corridors/dubai-desktop.webp',
      mobileWebp: '/images/corridors/dubai-mobile.webp'
    },
    istanbul: {
      desktop: '/images/corridors/istanbul-desktop.jpg',
      mobile: '/images/corridors/istanbul-mobile.jpg',
      webp: '/images/corridors/istanbul-desktop.webp',
      mobileWebp: '/images/corridors/istanbul-mobile.webp'
    }
  },
  offices: {
    consultation: '/images/offices/consultation-desk.jpg',
    consultationWebp: '/images/offices/consultation-desk.webp',
    gulfOffice: '/images/offices/gulf-luxury-office.jpg',
    gulfOfficeWebp: '/images/offices/gulf-luxury-office.webp'
  },
  liveRates: {
    terminal: '/images/live-rates/market-terminal.jpg',
    terminalWebp: '/images/live-rates/market-terminal.webp',
    particles: '/images/overlays/market-particles.svg'
  },
  footer: {
    institutional: '/images/footer/footer-institutional.jpg',
    institutionalWebp: '/images/footer/footer-institutional.webp'
  },
  overlays: {
    glass: '/images/overlays/glass-panel.svg',
    heroGrid: '/images/overlays/hero-grid.svg',
    worldRoutes: '/images/overlays/world-routes.svg',
    navyGradient: '/images/overlays/navy-gradient.svg'
  },
  video: {
    heroPoster: '/videos/hero-cinematic-poster.jpg',
    heroLoop: '/videos/hero-cinematic-loop.mp4'
  }
} as const;

export type CorridorKey = 'muscat' | 'dubai' | 'istanbul';

export const corridorAssetKey: Record<string, CorridorKey> = {
  muscat: 'muscat',
  dubai: 'dubai',
  istanbul: 'istanbul',
  مسقط: 'muscat',
  Muscat: 'muscat',
  دبی: 'dubai',
  Dubai: 'dubai',
  استانبول: 'istanbul',
  Istanbul: 'istanbul'
};

export function corridorImage(city: string, mobile = false) {
  const key = corridorAssetKey[city] ?? 'muscat';
  const set = visualAssets.corridors[key];
  return mobile ? set.mobile : set.desktop;
}

export function corridorImageWebp(city: string) {
  const key = corridorAssetKey[city] ?? 'muscat';
  return visualAssets.corridors[key].webp;
}
