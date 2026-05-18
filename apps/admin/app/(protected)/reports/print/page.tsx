import { headers } from 'next/headers';
import { serverApiFetch } from '../../../../lib/api';
import { formatMoney, fmtDateShort } from '../../../../lib/admin-format';

type ReportData = {
  period: { from: string; to: string };
  generatedAt: string;
  totals: {
    orderCount: number;
    completedCount: number;
    sourceVolume: number;
    targetVolume: number;
    feeVolume: number;
    completedTargetVolume: number;
    completedFees: number;
  };
  daily: Array<{
    date: string;
    orderCount: number;
    sourceVolume: number;
    targetVolume: number;
    feeVolume: number;
    completedCount: number;
  }>;
};

export default async function ReportPrintPage({
  searchParams
}: {
  searchParams: Promise<{ from?: string; to?: string; targetCurrency?: string; sourceCurrency?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  if (params.targetCurrency) query.set('targetCurrency', params.targetCurrency);
  if (params.sourceCurrency) query.set('sourceCurrency', params.sourceCurrency);
  const report = await serverApiFetch<ReportData>(
    `/admin/reports/summary?${query}`,
    (await headers()).get('cookie')
  );

  return (
    <div className="report-print-page">
      <p className="report-print-hint no-print">
        برای ذخیره PDF: Ctrl+P (یا Cmd+P) → Save as PDF
      </p>
      <h1>گزارش مالی OMoney</h1>
      <p className="report-print-meta">
        دوره: {report.period.from} تا {report.period.to} · تولید:{' '}
        {new Date(report.generatedAt).toLocaleString('fa-IR')}
      </p>

      <div className="report-print-grid">
        <article>
          <p>کل سفارش‌ها</p>
          <strong>{report.totals.orderCount.toLocaleString('fa-IR')}</strong>
        </article>
        <article>
          <p>تکمیل‌شده</p>
          <strong>{report.totals.completedCount.toLocaleString('fa-IR')}</strong>
        </article>
        <article>
          <p>کارمزد</p>
          <strong>{formatMoney(report.totals.feeVolume)}</strong>
        </article>
        <article>
          <p>حجم مبدأ</p>
          <strong>{formatMoney(report.totals.sourceVolume)}</strong>
        </article>
        <article>
          <p>حجم مقصد</p>
          <strong>{formatMoney(report.totals.targetVolume)}</strong>
        </article>
        <article>
          <p>مقصد تکمیل</p>
          <strong>{formatMoney(report.totals.completedTargetVolume)}</strong>
        </article>
      </div>

      <h2>روزنامه روزانه</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>تاریخ</th>
            <th>سفارش</th>
            <th>مبدأ</th>
            <th>مقصد</th>
            <th>کارمزد</th>
            <th>تکمیل</th>
          </tr>
        </thead>
        <tbody>
          {report.daily.map((day) => (
            <tr key={day.date}>
              <td>{fmtDateShort.format(new Date(day.date))}</td>
              <td>{day.orderCount.toLocaleString('fa-IR')}</td>
              <td>{formatMoney(day.sourceVolume)}</td>
              <td>{formatMoney(day.targetVolume)}</td>
              <td>{formatMoney(day.feeVolume)}</td>
              <td>{day.completedCount.toLocaleString('fa-IR')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>جمع</td>
            <td>{report.totals.orderCount.toLocaleString('fa-IR')}</td>
            <td>{formatMoney(report.totals.sourceVolume)}</td>
            <td>{formatMoney(report.totals.targetVolume)}</td>
            <td>{formatMoney(report.totals.feeVolume)}</td>
            <td>{report.totals.completedCount.toLocaleString('fa-IR')}</td>
          </tr>
        </tfoot>
      </table>
      <script dangerouslySetInnerHTML={{ __html: 'setTimeout(function(){window.print()},500)' }} />
    </div>
  );
}
