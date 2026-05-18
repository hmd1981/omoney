import { orderStatusFa, statusTone, ticketStatusFa, userStatusFa, kycStatusFa } from '../lib/admin-format';

const labels: Record<string, Record<string, string>> = {
  user: userStatusFa,
  order: orderStatusFa,
  ticket: ticketStatusFa,
  kyc: kycStatusFa
};

export function StatusBadge({
  value,
  kind = 'order'
}: {
  value: string;
  kind?: 'user' | 'order' | 'ticket' | 'kyc';
}) {
  const label = labels[kind][value] ?? value;
  return <span className={`admin-status-badge tone-${statusTone(value)}`}>{label}</span>;
}
