import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Vazirmatn } from 'next/font/google';

const adsenseClient = 'ca-pub-3160854101704307';
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? 'AW-712088539';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export const metadata: Metadata = {
  title: 'OMoney | International Remittance from Oman and UAE',
  description: 'Premium Persian-first remittance service with human support, KYC controls, and transparent transfer tracking across Oman, UAE, Turkey, Iran, Europe, Canada, and USA.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" className={`${inter.variable} ${vazirmatn.variable}`}>
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAdsId}');
            `
          }}
        />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
