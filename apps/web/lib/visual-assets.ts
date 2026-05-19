const corridorBase = '/images/corridors';

export const visualAssets = {
  hero: {
    muscat: {
      desktop: '/images/homepage-trust-banner.jpg',
      mobile: '/images/homepage-trust-banner.jpg',
      desktopWebp: '',
      mobileWebp: ''
    },
    global: {
      desktop: '/images/homepage-trust-banner.jpg',
      mobile: '/images/homepage-trust-banner.jpg',
      desktopWebp: '',
      mobileWebp: ''
    }
  },
  corridors: {
    dubai: {
      desktop: `${corridorBase}/dubai-desktop.jpg`,
      mobile: `${corridorBase}/dubai-mobile.jpg`,
      webp: `${corridorBase}/dubai-desktop.webp`,
      mobileWebp: `${corridorBase}/dubai-mobile.webp`
    },
    istanbul: {
      desktop: `${corridorBase}/istanbul-desktop.jpg`,
      mobile: `${corridorBase}/istanbul-mobile.jpg`,
      webp: `${corridorBase}/istanbul-desktop.webp`,
      mobileWebp: `${corridorBase}/istanbul-mobile.webp`
    },
    muscat: {
      desktop: `${corridorBase}/muscat-desktop.jpg`,
      mobile: `${corridorBase}/muscat-mobile.jpg`,
      webp: `${corridorBase}/muscat-desktop.webp`,
      mobileWebp: `${corridorBase}/muscat-mobile.webp`
    }
  },
  offices: {
    consultation: '/images/omani-exchange-brand.png',
    consultationWebp: ''
  },
  liveRates: {
    terminal: '/images/homepage-trust-banner.jpg',
    terminalWebp: '',
    particles: ''
  },
  footer: {
    institutional: '/images/omani-exchange-brand.png',
    institutionalWebp: ''
  },
  overlays: {
    navyGradient: '',
    worldRoutes: '',
    heroGrid: ''
  }
};

export function corridorImageWebp(city: 'muscat' | 'dubai' | 'istanbul') {
  return visualAssets.corridors[city].webp;
}
