'use client';

import { useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Snapshot = {
  baseCurrency: string;
  marketRateToman: string | null;
  buyRateToman: string | null;
  sellRateToman: string | null;
  sourceProvider: string;
  createdAt: string;
  stale: boolean;
  unavailable: boolean;
};

type Override = {
  enabled: boolean;
  frozen: boolean;
  manualMarketRateToman: string | null;
  buyMarkupPercent: string | null;
  sellMarkupPercent: string | null;
  fixedBuyRateToman: string | null;
  fixedSellRateToman: string | null;
  reason: string | null;
};

export function RateOverrideForm({ snapshot, override }: { snapshot: Snapshot; override: Override | null }) {
  const [form, setForm] = useState({
    enabled: override?.enabled ?? true,
    frozen: override?.frozen ?? false,
    manualMarketRateToman: override?.manualMarketRateToman ?? '',
    buyMarkupPercent: override?.buyMarkupPercent ?? '',
    sellMarkupPercent: override?.sellMarkupPercent ?? '',
    fixedBuyRateToman: override?.fixedBuyRateToman ?? '',
    fixedSellRateToman: override?.fixedSellRateToman ?? '',
    reason: override?.reason ?? ''
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    try {
      await apiFetch(`/admin/exchange-rates/overrides/${snapshot.baseCurrency}`, {
        method: 'PATCH',
        body: JSON.stringify({
          enabled: form.enabled,
          frozen: form.frozen,
          manualMarketRateToman: nullableNumber(form.manualMarketRateToman),
          buyMarkupPercent: nullableNumber(form.buyMarkupPercent),
          sellMarkupPercent: nullableNumber(form.sellMarkupPercent),
          fixedBuyRateToman: nullableNumber(form.fixedBuyRateToman),
          fixedSellRateToman: nullableNumber(form.fixedSellRateToman),
          reason: form.reason || null
        })
      });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={submit} className="admin-panel space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-black/60">{snapshot.baseCurrency}/TOMAN</p>
          <h2 className="text-lg font-semibold">
            Market {display(snapshot.marketRateToman)} · Buy {display(snapshot.buyRateToman)} · Sell {display(snapshot.sellRateToman)}
          </h2>
          <p className="text-xs text-black/50">
            {snapshot.sourceProvider} · updated {new Date(snapshot.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {snapshot.stale ? <span className="admin-badge">stale</span> : null}
          {snapshot.unavailable ? <span className="admin-badge">unavailable</span> : null}
          <label className="admin-badge flex items-center gap-2">
            <input type="checkbox" checked={form.enabled} onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))} />
            override
          </label>
          <label className="admin-badge flex items-center gap-2">
            <input type="checkbox" checked={form.frozen} onChange={(event) => setForm((current) => ({ ...current, frozen: event.target.checked }))} />
            freeze
          </label>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Manual market Toman" value={form.manualMarketRateToman} onChange={(value) => setForm((current) => ({ ...current, manualMarketRateToman: value }))} />
        <Field label="Buy markup %" value={form.buyMarkupPercent} onChange={(value) => setForm((current) => ({ ...current, buyMarkupPercent: value }))} />
        <Field label="Sell markup %" value={form.sellMarkupPercent} onChange={(value) => setForm((current) => ({ ...current, sellMarkupPercent: value }))} />
        <Field label="Fixed buy Toman" value={form.fixedBuyRateToman} onChange={(value) => setForm((current) => ({ ...current, fixedBuyRateToman: value }))} />
        <Field label="Fixed sell Toman" value={form.fixedSellRateToman} onChange={(value) => setForm((current) => ({ ...current, fixedSellRateToman: value }))} />
        <Field label="Reason" value={form.reason} onChange={(value) => setForm((current) => ({ ...current, reason: value }))} />
      </div>
      <div className="flex items-center gap-3">
        <button className="admin-button" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving...' : 'Save pair'}
        </button>
        {status === 'saved' ? <span className="text-sm text-emerald-700">Saved</span> : null}
        {status === 'error' ? <span className="text-sm text-red-700">Save failed</span> : null}
      </div>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-black/60">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="admin-input" />
    </label>
  );
}

function display(value: string | null) {
  return value ? Number(value).toLocaleString() : '—';
}

function nullableNumber(value: string) {
  return value.trim() === '' ? null : Number(value);
}
