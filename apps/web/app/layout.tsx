import './globals.css';
import type { Metadata } from 'next';

const adsenseClient = 'ca-pub-3160854101704307';

export const metadata: Metadata = {
  title: 'OMoney | International Remittance from Oman and UAE',
  description: 'Premium Persian-first remittance service with human support, KYC controls, and transparent transfer tracking across Oman, UAE, Turkey, Iran, Europe, Canada, and USA.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa">
      <head>
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
