import Link from 'next/link';
import { headers } from 'next/headers';
import { serverApiFetch } from '../../../lib/api';
import { formatMoney, fmtDateShort } from '../../../lib/admin-format';
import { ReportExportButtons } from '../../../components/export-buttons';
import { CurrencyFilterSelects } from '../../../components/currency-filter-selects';

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

function defaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10)
  };
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ from?: string; to?: string; targetCurrency?: string; sourceCurrency?: string }>;
}) {
  const params = await searchParams;
  const defaults = defaultRange();
  const from = params.from ?? defaults.from;
  const to = params.to ?? defaults.to;
  const query = new URLSearchParams({ from, to });
  if (params.targetCurrency) query.set('targetCurrency', params.targetCurrency);
  if (params.sourceCurrency) query.set('sourceCurrency', params.sourceCurrency);
  const cookieHeader = (await headers()).get('cookie');
  const [report, currencies] = await Promise.all([
    serverApiFetch<ReportData>(`/admin/reports/summary?${query}`, cookieHeader),
    serverApiFetch<Array<{ code: string; name: string; symbol: string }>>('/admin/currencies', cookieHeader)
  ]);
  const currencyNote =
    params.targetCurrency || params.sourceCurrency
      ? ` · ارز خرید: ${params.targetCurrency ?? 'همه'} · ارز پرداخت: ${params.sourceCurrency ?? 'همه'}`
      : '';

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-5 pb-12">
      <header className="dashboard-hero">
        <div>
          <p className="dashboard-kicker">گزارش مالی حرفه‌ای</p>
          <h1>گزارش دوره‌ای</h1>
          <p className="dashboard-sub">
            از {report.period.from} تا {report.period.to}
            {currencyNote} — تجمیع روزانه و خروجی Excel / PDF
          </p>
        </div>
        <form className="flex flex-wrap items-end gap-2" action="/reports" method="get">
          <label className="text-sm">
            از تاریخ
            <input type="date" name="from" defaultValue={from} className="admin-input mt-1 block" />
          </label>
          <label className="text-sm">
            تا تاریخ
            <input type="date" name="to" defaultValue={to} className="admin-input mt-1 block" />
          </label>
          <div className="flex flex-wrap gap-2">
            <CurrencyFilterSelects
              currencies={currencies}
              targetCurrency={params.targetCurrency}
              sourceCurrency={params.sourceCurrency}
            />
          </div>
          <button type="submit" className="admin-button">
            نمایش گزارش
          </button>
        </form>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ReportExportButtons searchParams={query.toString()} />
        <Link
          href={`/reports/print?${query}`}
          target="_blank"
          className="export-btn export-btn-print"
        >
          نسخه چاپ / PDF مرورگر
        </Link>
      </div>

      <section className="platform-accounting-strip">
        <article className="platform-accounting-card">
          <p>کل سفارش‌ها</p>
          <strong>{report.totals.orderCount.toLocaleString('fa-IR')}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>تکمیل‌شده</p>
          <strong>{report.totals.completedCount.toLocaleString('fa-IR')}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>حجم مبدأ</p>
          <strong>{formatMoney(report.totals.sourceVolume)}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>حجم مقصد</p>
          <strong>{formatMoney(report.totals.targetVolume)}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>کارمزد</p>
          <strong>{formatMoney(report.totals.feeVolume)}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>مقصد تکمیل + کارمزد</p>
          <strong>
            {formatMoney(report.totals.completedTargetVolume)} / {formatMoney(report.totals.completedFees)}
          </strong>
        </article>
      </section>

      <section className="admin-panel">
        <h2 className="section-title">روزنامه روزانه (تجمیع)</h2>
        <p className="section-sub">هر سطر = یک روز در بازه انتخاب‌شده</p>
        <div className="admin-table-wrap ledger-table-wrap mt-4">
          <table className="admin-table ledger-table">
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>تعداد سفارش</th>
                <th>حجم مبدأ</th>
                <th>حجم مقصد</th>
                <th>کارمزد</th>
                <th>تکمیل‌شده</th>
              </tr>
            </thead>
            <tbody>
              {report.daily.map((day) => (
                <tr key={day.date}>
                  <td>
                    <Link
                      href={`/ledger?createdFrom=${day.date}&createdTo=${day.date}${params.targetCurrency ? `&targetCurrency=${params.targetCurrency}` : ''}${params.sourceCurrency ? `&sourceCurrency=${params.sourceCurrency}` : ''}`}
                      className="hover:underline"
                    >
                      {fmtDateShort.format(new Date(day.date))}
                    </Link>
                  </td>
                  <td>{day.orderCount.toLocaleString('fa-IR')}</td>
                  <td>{formatMoney(day.sourceVolume)}</td>
                  <td>{formatMoney(day.targetVolume)}</td>
                  <td>{formatMoney(day.feeVolume)}</td>
                  <td>{day.completedCount.toLocaleString('fa-IR')}</td>
                </tr>
              ))}
              {!report.daily.length ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-black/55">
                    در این بازه تراکنشی ثبت نشده.
                  </td>
                </tr>
              ) : null}
            </tbody>
            {report.daily.length ? (
              <tfoot>
                <tr className="ledger-totals-row">
                  <td>جمع دوره</td>
                  <td>{report.totals.orderCount.toLocaleString('fa-IR')}</td>
                  <td>{formatMoney(report.totals.sourceVolume)}</td>
                  <td>{formatMoney(report.totals.targetVolume)}</td>
                  <td>{formatMoney(report.totals.feeVolume)}</td>
                  <td>{report.totals.completedCount.toLocaleString('fa-IR')}</td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </section>

      <p className="text-sm text-black/50">
        تولید شده: {new Date(report.generatedAt).toLocaleString('fa-IR')} · برای جزئیات هر روز روی تاریخ کلیک کنید.
      </p>
    </main>
  );
}
