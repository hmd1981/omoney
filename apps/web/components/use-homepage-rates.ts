'use client';

import { Fragment, createElement, useEffect, useState } from 'react';

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

type HomepageRatesState = {
  rates: LiveRate[];
  loading: boolean;
  refreshing: boolean;
  hasFetchError: boolean;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const listeners = new Set<(state: HomepageRatesState) => void>();

let state: HomepageRatesState = {
  rates: [],
  loading: true,
  refreshing: false,
  hasFetchError: false
};

let intervalId: number | null = null;
let inFlight: Promise<void> | null = null;

export function HomepageRatesProvider({ children }: { children: React.ReactNode }) {
  return createElement(Fragment, null, children);
}

export function useHomepageRates() {
  return useRatesState();
}

function useRatesState() {
  const [current, setCurrent] = useState(state);

  useEffect(() => {
    listeners.add(setCurrent);
    startRatesPolling();

    return () => {
      listeners.delete(setCurrent);
      if (listeners.size === 0 && intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, []);

  return current;
}

function startRatesPolling() {
  void loadRates(true);
  if (intervalId === null) {
    intervalId = window.setInterval(() => void loadRates(false), 60_000);
  }
}

function updateState(next: HomepageRatesState) {
  state = next;
  listeners.forEach((listener) => listener(state));
}

async function loadRates(initial = false) {
  if (inFlight) return inFlight;

  if (!initial) {
    updateState({ ...state, refreshing: true });
  }

  inFlight = fetch(`${apiBase}/exchange-rates/homepage`, { cache: 'no-store' })
    .then(async (response) => {
      if (!response.ok) throw new Error('Failed to load rates');
      const rates = (await response.json()) as LiveRate[];
      updateState({ rates, loading: false, refreshing: false, hasFetchError: false });
    })
    .catch(() => {
      updateState({ ...state, loading: false, refreshing: false, hasFetchError: true });
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
