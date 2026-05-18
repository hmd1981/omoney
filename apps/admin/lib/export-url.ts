export function ledgerExportUrl(params: URLSearchParams, format: 'csv' | 'xlsx' | 'pdf') {
  const query = new URLSearchParams(params);
  query.set('format', format);
  return `/api/admin/export/ledger?${query.toString()}`;
}

export function reportExportUrl(params: URLSearchParams, format: 'csv' | 'xlsx' | 'pdf') {
  const query = new URLSearchParams(params);
  query.set('format', format);
  return `/api/admin/export/report?${query.toString()}`;
}
