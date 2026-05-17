'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export function OrderStatusForm({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [next, setNext] = useState(status);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  async function submit() {
    await apiFetch(`/admin/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status: next, note }) });
    setMessage('Status updated');
    router.refresh();
  }
  return <div className="admin-panel grid gap-3">
    <h2>Update status</h2>
    <select value={next} onChange={(e) => setNext(e.target.value)} className="admin-input">
      {['DRAFT','SUBMITTED','WAITING_FOR_PAYMENT','PAYMENT_UPLOADED','UNDER_REVIEW','PROCESSING','COMPLETED','REJECTED','CANCELLED'].map((s) => <option key={s}>{s}</option>)}
    </select>
    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note" className="admin-textarea" />
    <button onClick={() => void submit()} className="admin-button">Save status</button>
    {message && <p className="text-sm text-black/60">{message}</p>}
  </div>;
}
