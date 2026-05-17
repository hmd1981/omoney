'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type KycDoc = {
  id: string;
  documentType: string;
  mimeType: string;
  sizeBytes: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

const documentTypes = [
  { value: 'NATIONAL_ID', fa: 'کارت ملی / شناسنامه', en: 'National ID' },
  { value: 'PASSPORT', fa: 'پاسپورت', en: 'Passport' },
  { value: 'PROOF_OF_ADDRESS', fa: 'مدرک آدرس', en: 'Proof of address' },
  { value: 'SELFIE_WITH_ID', fa: 'سلفی با مدرک', en: 'Selfie with ID' }
] as const;

function statusLabel(status: KycDoc['status'], fa: boolean) {
  if (status === 'PENDING') return fa ? 'در انتظار بررسی' : 'Pending review';
  if (status === 'APPROVED') return fa ? 'تأیید شده' : 'Approved';
  return fa ? 'رد شده' : 'Rejected';
}

export function KycUploadPanel({ locale }: { locale: 'fa' | 'en' }) {
  const fa = locale === 'fa';
  const [documents, setDocuments] = useState<KycDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    const token = localStorage.getItem('omoney_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    const response = await fetch(`${apiBase}/kyc/documents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      setDocuments((await response.json()) as KycDoc[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setMessage(null);
    setError(null);
    const token = localStorage.getItem('omoney_access_token');
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch(`${apiBase}/kyc/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    setUploading(false);
    if (!response.ok) {
      setError(fa ? 'آپلود انجام نشد. فقط JPG، PNG یا PDF تا ۱۰ مگابایت.' : 'Upload failed. Use JPG, PNG, or PDF up to 10 MB.');
      return;
    }
    setMessage(fa ? 'مدرک ثبت شد و در صف بررسی ادمین قرار گرفت.' : 'Document submitted and queued for admin review.');
    form.reset();
    await loadDocuments();
    window.dispatchEvent(new Event('omoney-kyc-updated'));
  }

  const latestStatus = documents[0]?.status ?? null;

  return (
    <section className="surface rounded-md p-6">
      <h2 className="text-xl font-semibold">{fa ? 'احراز هویت (KYC)' : 'Identity verification (KYC)'}</h2>
      <p className="mt-2 text-sm text-[#66707d]">
        {fa
          ? 'مدارک شناسایی خود را آپلود کنید. پس از بررسی تیم OMONEY وضعیت تأیید می‌شود.'
          : 'Upload your identity documents. OMONEY will review and update your verification status.'}
      </p>

      {latestStatus ? (
        <p className="mt-3 text-sm font-medium text-[#101e30]">
          {fa ? 'آخرین وضعیت: ' : 'Latest status: '}
          <span>{statusLabel(latestStatus, fa)}</span>
        </p>
      ) : (
        <p className="mt-3 text-sm text-amber-800">{fa ? 'هنوز مدرکی ثبت نشده است.' : 'No documents submitted yet.'}</p>
      )}

      <form onSubmit={submit} className="mt-5 grid gap-3 border-t border-black/10 pt-5">
        <label className="grid gap-2 text-sm">
          <span className="text-[#66707d]">{fa ? 'نوع مدرک' : 'Document type'}</span>
          <select name="documentType" required className="h-12 rounded-md border border-black/10 px-3">
            {documentTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {fa ? item.fa : item.en}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-[#66707d]">{fa ? 'فایل (JPG، PNG، PDF)' : 'File (JPG, PNG, PDF)'}</span>
          <input
            name="file"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="rounded-md border border-black/10 px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {message ? <p className="text-sm text-green-800">{message}</p> : null}
        <button
          type="submit"
          disabled={uploading}
          className="rounded-md bg-[#101e30] px-4 py-3 text-white disabled:opacity-60"
        >
          {uploading ? (fa ? 'در حال آپلود...' : 'Uploading...') : fa ? 'ارسال مدرک' : 'Submit document'}
        </button>
      </form>

      {loading ? (
        <p className="mt-4 text-sm text-[#66707d]">{fa ? 'در حال بارگذاری...' : 'Loading...'}</p>
      ) : documents.length > 0 ? (
        <ul className="mt-5 space-y-2 border-t border-black/10 pt-5 text-sm">
          {documents.map((doc) => (
            <li key={doc.id} className="rounded-md border border-black/10 px-3 py-2">
              <div>
                <span className="font-medium">
                  {documentTypes.find((t) => t.value === doc.documentType)?.[fa ? 'fa' : 'en'] ?? doc.documentType}
                </span>
                <span className="text-[#66707d]"> · {statusLabel(doc.status, fa)}</span>
              </div>
              <p className="mt-1 text-xs text-[#66707d]">
                {new Date(doc.createdAt).toLocaleString(fa ? 'fa-IR' : 'en-GB')}
              </p>
              {doc.status === 'REJECTED' && doc.rejectionReason ? (
                <p className="mt-1 text-xs text-red-700">
                  {fa ? 'دلیل رد: ' : 'Rejection: '}
                  {doc.rejectionReason}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function motion({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
