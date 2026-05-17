'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { LiveRate } from '../lib/homepage-rates';

type HomepageRatesContextValue = {
  rates: LiveRate[];
  loading: boolean;
  refreshing: boolean;
  hasFetchError: boolean;
};

const HomepageRatesContext = createContext<HomepageRatesContextValue | null>(null);

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function HomepageRatesProvider({
  initialRates,
  children
}: {
  initialRates: LiveRate[];
  children: React.ReactNode;
}) {
  const [rates, setRates] = useState<LiveRate[]>(initialRates);
  const [loading, setLoading] = useState(initialRates.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [hasFetchError, setHasFetchError] = useState(false);

  useEffect(() => {
    let active = true;

    async function load(isInitial = false) {
      if (!isInitial) setRefreshing(true);
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

    if (initialRates.length === 0) {
      void load(true);
    }

    const interval = window.setInterval(() => void load(), 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [initialRates.length]);

  const value = useMemo(
    () => ({ rates, loading, refreshing, hasFetchError }),
    [rates, loading, refreshing, hasFetchError]
  );

  return <HomepageRatesContext.Provider value={value}>{children}</HomepageRatesContext.Provider>;
}

export function useHomepageRates() {
  const context = useContext(HomepageRatesContext);
  if (!context) {
    throw new Error('useHomepageRates must be used within HomepageRatesProvider');
  }
  return context;
}
