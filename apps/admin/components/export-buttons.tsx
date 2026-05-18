'use client';

import { ledgerExportUrl, reportExportUrl } from '../lib/export-url';

export function LedgerExportButtons({ searchParams }: { searchParams: string }) {
  const params = new URLSearchParams(searchParams);
  return <ExportButtons build={(format) => ledgerExportUrl(params, format)} />;
}

export function ReportExportButtons({ searchParams }: { searchParams: string }) {
  const params = new URLSearchParams(searchParams);
  return <ExportButtons build={(format) => reportExportUrl(params, format)} />;
}

function ExportButtons({ build }: { build: (format: 'csv' | 'xlsx' | 'pdf') => string }) {
  return (
    <div className="export-buttons">
      <a className="export-btn" href={build('xlsx')}>
        Excel (.xlsx)
      </a>
      <a className="export-btn" href={build('csv')}>
        CSV (Excel)
      </a>
      <a className="export-btn export-btn-pdf" href={build('pdf')}>
        PDF
      </a>
    </div>
  );
}
