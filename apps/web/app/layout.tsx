import './globals.css';
import type { Metadata } from 'next';
import { Inter, Vazirmatn } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter'
});

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-vazirmatn'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://omoney.online'),
  title: {
    default: 'OMoney | International Remittance from Oman and UAE',
    template: '%s'
  },
  description:
    'Premium remittance and exchange service with human support, KYC controls, and transparent transfer tracking across Oman, UAE, Turkey, Iran, Europe, Canada, and USA.',
  applicationName: 'OMoney',
  referrer: 'strict-origin-when-cross-origin',
  robots: {
    index: true,
    follow: true
  }
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa-IR" className={`${inter.variable} ${vazirmatn.variable}`}>
      <body>{children}</body>
    </html>
  );
}
