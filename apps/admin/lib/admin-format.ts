export const fmtNum = new Intl.NumberFormat('fa-IR');
export const fmtDate = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' });
export const fmtDateShort = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' });

export function formatMoney(value: number | string, currency?: string) {
  const amount = typeof value === 'string' ? Number(value) : value;
  const formatted = fmtNum.format(Number.isFinite(amount) ? amount : 0);
  return currency ? `${formatted} ${currency}` : formatted;
}

export const userStatusFa: Record<string, string> = {
  ACTIVE: 'فعال',
  SUSPENDED: 'مسدود',
  PENDING_VERIFICATION: 'در انتظار تأیید'
};

export const orderStatusFa: Record<string, string> = {
  DRAFT: 'پیش‌نویس',
  SUBMITTED: 'ثبت‌شده',
  WAITING_FOR_PAYMENT: 'منتظر پرداخت',
  PAYMENT_UPLOADED: 'رسید آپلود',
  UNDER_REVIEW: 'در بررسی',
  PROCESSING: 'در حال پردازش',
  COMPLETED: 'تکمیل',
  REJECTED: 'رد شده',
  CANCELLED: 'لغو شده'
};

export const ticketStatusFa: Record<string, string> = {
  OPEN: 'باز',
  IN_PROGRESS: 'در حال پیگیری',
  RESOLVED: 'حل‌شده',
  CLOSED: 'بسته'
};

export const kycStatusFa: Record<string, string> = {
  PENDING: 'در انتظار',
  APPROVED: 'تأیید',
  REJECTED: 'رد'
};

export function statusTone(status: string): string {
  if (['ACTIVE', 'COMPLETED', 'APPROVED', 'RESOLVED', 'CLOSED'].includes(status)) return 'ok';
  if (['SUSPENDED', 'REJECTED', 'CANCELLED'].includes(status)) return 'bad';
  if (['PENDING', 'PENDING_VERIFICATION', 'WAITING_FOR_PAYMENT', 'OPEN', 'DRAFT'].includes(status)) return 'warn';
  return 'neutral';
}
