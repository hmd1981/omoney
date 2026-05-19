export type LiveRate = {
  baseCurrency: string;
  quoteCurrency: 'TOMAN';
  marketRateToman: number | null;
  buyRateToman: number | null;
  sellRateToman: number | null;
  source: string;
  sourceKey: string | null;
  updatedAt: string;
  stale: boolean;
  unavailable: boolean;
  direction: 'up' | 'down' | 'stable' | 'unknown';
};

export async function getHomepageRates(): Promise<LiveRate[]> {
  const base =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.PUBLIC_API_URL ??
    'http://localhost:4000';

  try {
    const response = await fetch(`${base}/exchange-rates/homepage`, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    return (await response.json()) as LiveRate[];
  } catch {
    return [];
  }
}
