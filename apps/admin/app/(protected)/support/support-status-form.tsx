'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '../../../lib/api';

export function SupportStatusForm({ id, status, priority, assignedToId }: { id: string; status: string; priority: string; assignedToId: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState({ status, priority, assignedToId: assignedToId ?? '' });
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await apiFetch(`/admin/support-tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status: form.status, priority: form.priority, assignedToId: form.assignedToId || null }) });
    setSaving(false);
    router.refresh();
  }
  return <form onSubmit={submit} className="grid gap-2">
    <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="admin-input">{['OPEN','IN_PROGRESS','RESOLVED','CLOSED'].map((item) => <option key={item}>{item}</option>)}</select>
    <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} className="admin-input">{['LOW','NORMAL','HIGH','URGENT'].map((item) => <option key={item}>{item}</option>)}</select>
    <input value={form.assignedToId} onChange={(event) => setForm((current) => ({ ...current, assignedToId: event.target.value }))} placeholder="Admin user id or leave blank" className="admin-input" />
    <button className="admin-button" disabled={saving}>{saving ? 'Saving...' : 'Save ticket'}</button>
  </form>;
}
