'use client';

import { useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Settings = {
  enableLiveRates: boolean;
  defaultProvider: string;
  fallbackProvider: string;
  staleAfterSec: number;
  globalBuyMarkupPercent: string;
  globalSellMarkupPercent: string;
};

export function RateSettingsForm({ settings }: { settings: Settings }) {
  const [form, setForm] = useState({
    enableLiveRates: settings.enableLiveRates,
    defaultProvider: settings.defaultProvider,
    fallbackProvider: settings.fallbackProvider,
    staleAfterSec: String(settings.staleAfterSec),
    globalBuyMarkupPercent: String(settings.globalBuyMarkupPercent),
    globalSellMarkupPercent: String(settings.globalSellMarkupPercent)
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    try {
      await apiFetch('/admin/exchange-rates/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          enableLiveRates: form.enableLiveRates,
          defaultProvider: form.defaultProvider,
          fallbackProvider: form.fallbackProvider,
          staleAfterSec: Number(form.staleAfterSec),
          globalBuyMarkupPercent: Number(form.globalBuyMarkupPercent),
          globalSellMarkupPercent: Number(form.globalSellMarkupPercent)
        })
      });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={submit} className="admin-panel space-y-4">
      <div>
        <p className="text-sm text-black/60">Global controls</p>
        <h2 className="text-lg font-semibold">Rate settings</h2>
      </div>
      <label className="flex items-center justify-between gap-4 text-sm">
        <span>Enable live rates</span>
        <input
          type="checkbox"
          checked={form.enableLiveRates}
          onChange={(event) => setForm((current) => ({ ...current, enableLiveRates: event.target.checked }))}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Default provider" value={form.defaultProvider} onChange={(value) => setForm((current) => ({ ...current, defaultProvider: value }))} />
        <Field label="Fallback provider" value={form.fallbackProvider} onChange={(value) => setForm((current) => ({ ...current, fallbackProvider: value }))} />
        <Field label="Stale after (sec)" value={form.staleAfterSec} onChange={(value) => setForm((current) => ({ ...current, staleAfterSec: value }))} />
        <Field label="Buy markup %" value={form.globalBuyMarkupPercent} onChange={(value) => setForm((current) => ({ ...current, globalBuyMarkupPercent: value }))} />
        <Field label="Sell markup %" value={form.globalSellMarkupPercent} onChange={(value) => setForm((current) => ({ ...current, globalSellMarkupPercent: value }))} />
      </div>
      <div className="flex items-center gap-3">
        <button className="admin-button" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving...' : 'Save settings'}
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
