'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '../../../lib/api';

export function RevokeSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function revoke() {
    if (!confirm('Revoke this session? The user will need to sign in again.')) return;
    setLoading(true);
    try {
      await apiFetch(`/admin/sessions/${sessionId}/revoke`, { method: 'POST' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void revoke()}
      className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-800 hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? 'Revoking…' : 'Revoke session'}
    </button>
  );
}
