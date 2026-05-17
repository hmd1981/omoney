'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch, publicApiBase } from '../../../lib/api';

export function KycQueueActions({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  async function review(next: 'APPROVED' | 'REJECTED') {
    if (next === 'REJECTED' && !reason.trim()) {
      setMessage('Enter rejection reason');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await apiFetch(`/admin/kyc/documents/${documentId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: next,
          rejectionReason: next === 'REJECTED' ? reason.trim() : undefined
        })
      });
      setMessage(next === 'APPROVED' ? 'Approved' : 'Rejected');
      router.refresh();
    } catch {
      setMessage('Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:min-w-[280px]">
      <a
        href={`${publicApiBase}/admin/kyc/documents/${documentId}/file`}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-[#11221f] underline"
      >
        View file
      </a>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void review('APPROVED')}
          className="rounded-md bg-green-700 px-3 py-1 text-sm text-white disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void review('REJECTED')}
          className="rounded-md bg-red-700 px-3 py-1 text-sm text-white disabled:opacity-60"
        >
          Reject
        </button>
      </div>
      <input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Rejection reason (required to reject)"
        className="rounded border px-2 py-1 text-sm"
      />
      {message ? <span className="text-xs text-black/60">{message}</span> : null}
    </div>
  );
}
