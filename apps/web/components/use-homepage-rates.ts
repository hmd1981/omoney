'use client';

import { useEffect, useState } from 'react';

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

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function useHomepageRates() {
  const [rates, setRates] = useState<LiveRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasFetchError, setHasFetchError] = useState(false);

  useEffect(() => {
    let active = true;

    async function load(initial = false) {
      if (!initial) setRefreshing(true);
      try {
        const response = await fetch(`${apiBase}/exchange-rates/homepage`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load rates');
        const data = (await response.json()) as LiveRate[];
        if (active) {
          setRates(data);
          setHasFetchError(false);
        }
      } catch {
        if (active) setHasFetchError(true);
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void load(true);
    const interval = window.setInterval(() => void load(), 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return { rates, loading, refreshing, hasFetchError };
}
