'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export function UserStatusActions({ userId, status }: { userId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function updateStatus(next: 'ACTIVE' | 'SUSPENDED') {
    setLoading(true);
    setMessage('');
    try {
      await apiFetch(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next })
      });
      setMessage(`Status updated to ${next}`);
      router.refresh();
    } catch {
      setMessage('Failed to update status');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded bg-black/5 px-2 py-1 text-sm">{status}</span>
      {status !== 'ACTIVE' ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void updateStatus('ACTIVE')}
          className="rounded-md border px-3 py-1 text-sm hover:bg-black/5"
        >
          Activate
        </button>
      ) : null}
      {status !== 'SUSPENDED' ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void updateStatus('SUSPENDED')}
          className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-800 hover:bg-red-50"
        >
          Suspend
        </button>
      ) : null}
      {message ? <span className="text-sm text-black/60">{message}</span> : null}
    </div>
  );
}
