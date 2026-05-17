'use client';
import { useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { useRouter } from 'next/navigation';
export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function refresh() { setLoading(true); await apiFetch('/admin/exchange-rates/refresh', { method: 'POST' }); router.refresh(); setLoading(false); }
  return <button onClick={() => void refresh()} disabled={loading} className="admin-button">{loading ? 'Refreshing...' : 'Refresh now'}</button>;
}
