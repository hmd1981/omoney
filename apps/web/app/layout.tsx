import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'OMoney | International Remittance from Oman and UAE',
  description: 'Premium Persian-first remittance service with human support, KYC controls, and transparent transfer tracking across Oman, UAE, Turkey, Iran, Europe, Canada, and USA.'
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fa"><body>{children}</body></html>;
}
