'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export function OrderNoteForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    try {
      await apiFetch(`/admin/orders/${orderId}/notes`, { method: 'POST', body: JSON.stringify({ body }) });
      setBody('');
      setStatus('saved');
      router.refresh();
    } catch {
      setStatus('error');
    }
  }
  return <form onSubmit={submit} className="admin-panel grid gap-3">
    <h2>Add internal note</h2>
    <textarea value={body} onChange={(event) => setBody(event.target.value)} className="admin-textarea" placeholder="Compliance, payment, or follow-up note" />
    <button className="admin-button" disabled={status === 'saving' || body.trim().length < 2}>{status === 'saving' ? 'Saving...' : 'Save note'}</button>
    {status === 'saved' ? <p className="text-sm text-emerald-700">Saved</p> : null}
    {status === 'error' ? <p className="text-sm text-red-700">Save failed</p> : null}
  </form>;
}
