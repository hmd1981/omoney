'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch, publicApiBase } from '../../../../lib/api';

export function KycDocumentActions({
  documentId,
  status
}: {
  documentId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  async function review(next: 'APPROVED' | 'REJECTED') {
    if (next === 'REJECTED' && !reason.trim()) {
      setMessage('Enter a rejection reason');
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
      setMessage(`Marked as ${next}`);
      router.refresh();
    } catch {
      setMessage('Review failed');
    } finally {
      setLoading(false);
    }
  }

  if (status !== 'PENDING') {
    return <span className="text-black/60">{status}</span>;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <a
        href={`${publicApiBase}/admin/kyc/documents/${documentId}/file`}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-[#11221f] underline"
      >
        View file
      </a>
      <button
        type="button"
        disabled={loading}
        onClick={() => void review('APPROVED')}
        className="rounded-md border border-green-200 px-2 py-1 text-sm text-green-800 hover:bg-green-50"
      >
        Approve
      </button>
      <input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Rejection reason"
        className="min-w-[140px] rounded border px-2 py-1 text-sm"
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => void review('REJECTED')}
        className="rounded-md border border-red-200 px-2 py-1 text-sm text-red-800 hover:bg-red-50"
      >
        Reject
      </button>
      {message ? <span className="text-xs text-black/60">{message}</span> : null}
    </div>
  );
}
