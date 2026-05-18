import Link from 'next/link';
import { formatMoney, fmtDate } from '../lib/admin-format';
import { StatusBadge } from './status-badge';

export type LedgerOrder = {
  id: string;
  status: string;
  sourceAmount: string;
  targetAmount: string;
  feeAmount: string;
  beneficiaryName: string;
  beneficiaryBank: string | null;
  createdAt: string;
  updatedAt: string;
  corridor: {
    sourceCountry: string;
    targetCountry: string;
    sourceCurrency: { code: string };
    targetCurrency: { code: string };
  };
  paymentProofs: { id: string; mimeType: string; createdAt: string }[];
  _count: { statusHistory: number; internalNotes: number };
};

export function UserLedgerTable({ orders }: { orders: LedgerOrder[] }) {
  if (!orders.length) {
    return <p className="text-sm text-black/55">هنوز تراکنش حواله‌ای ثبت نشده است.</p>;
  }

  return (
    <div className="admin-table-wrap ledger-table-wrap">
      <table className="admin-table ledger-table">
        <thead>
          <tr>
            <th>تاریخ</th>
            <th>مبدأ → مقصد</th>
            <th>مبلغ مبدأ</th>
            <th>مبلغ مقصد</th>
            <th>کارمزد</th>
            <th>ذینفع</th>
            <th>وضعیت</th>
            <th>رسید</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <div className="ledger-date">{fmtDate.format(new Date(order.createdAt))}</div>
                <span className="ledger-id">{order.id.slice(0, 10)}…</span>
              </td>
              <td>
                <strong>
                  {order.corridor.sourceCurrency.code} → {order.corridor.targetCurrency.code}
                </strong>
                <span className="block text-xs text-black/50">
                  {order.corridor.sourceCountry} → {order.corridor.targetCountry}
                </span>
              </td>
              <td>{formatMoney(order.sourceAmount, order.corridor.sourceCurrency.code)}</td>
              <td>{formatMoney(order.targetAmount, order.corridor.targetCurrency.code)}</td>
              <td>{formatMoney(order.feeAmount)}</td>
              <td>
                <span className="font-medium">{order.beneficiaryName}</span>
                {order.beneficiaryBank ? (
                  <span className="block text-xs text-black/50">{order.beneficiaryBank}</span>
                ) : null}
              </td>
              <td>
                <StatusBadge value={order.status} kind="order" />
              </td>
              <td>{order.paymentProofs.length ? `${order.paymentProofs.length} فایل` : '—'}</td>
              <td>
                <Link href={`/orders/${order.id}`} className="ledger-link">
                  جزئیات
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <LedgerTotals orders={orders} />
        </tfoot>
      </table>
    </div>
  );
}

function LedgerTotals({ orders }: { orders: LedgerOrder[] }) {
  const source = orders.reduce((sum, o) => sum + Number(o.sourceAmount), 0);
  const target = orders.reduce((sum, o) => sum + Number(o.targetAmount), 0);
  const fees = orders.reduce((sum, o) => sum + Number(o.feeAmount), 0);
  const completed = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <tr className="ledger-totals-row">
      <td colSpan={2}>جمع این حساب ({orders.length} ردیف · {completed} تکمیل)</td>
      <td>{formatMoney(source)}</td>
      <td>{formatMoney(target)}</td>
      <td>{formatMoney(fees)}</td>
      <td colSpan={4}></td>
    </tr>
  );
}
