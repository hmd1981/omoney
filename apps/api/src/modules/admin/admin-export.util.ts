import { Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export type LedgerExportRow = {
  id: string;
  createdAt: string;
  customerEmail: string;
  customerName: string;
  beneficiaryName: string;
  corridor: string;
  sourceAmount: number;
  targetAmount: number;
  feeAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
  status: string;
  paymentProofs: number;
};

export type ReportExportPayload = {
  from: string;
  to: string;
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
  rows: LedgerExportRow[];
};

function csvEscape(value: string | number) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function sendCsv(res: Response, filename: string, headers: string[], rows: (string | number)[][]) {
  const lines: string[] = [];
  if (headers.length) lines.push(headers.map(csvEscape).join(','));
  for (const row of rows) lines.push(row.map(csvEscape).join(','));
  const body = `\uFEFF${lines.join('\n')}`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(body);
}

export function sendCsvLines(res: Response, filename: string, rows: (string | number)[][]) {
  sendCsv(res, filename, [], rows);
}

export async function sendXlsx(
  res: Response,
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'OMoney Admin';
  const sheet = workbook.addWorksheet(sheetName);
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };
  for (const row of rows) sheet.addRow(row);
  sheet.columns.forEach((column) => {
    column.width = 18;
  });
  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(Buffer.from(buffer));
}

export function sendPdf(
  res: Response,
  filename: string,
  title: string,
  sections: Array<{ heading: string; lines: string[] }>
) {
  const doc = new PDFDocument({ margin: 48, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
  doc.fontSize(18).text(title, { align: 'left' });
  doc.moveDown();
  for (const section of sections) {
    doc.fontSize(13).text(section.heading, { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(10);
    for (const line of section.lines) {
      doc.text(line);
    }
    doc.moveDown();
  }
  doc.end();
}

export async function sendReportXlsx(res: Response, filename: string, payload: ReportExportPayload) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'OMoney Admin';
  const summary = workbook.addWorksheet('Summary');
  summary.addRow(['OMoney Financial Report']);
  summary.addRow(['From', payload.from]);
  summary.addRow(['To', payload.to]);
  summary.addRow(['Generated', payload.generatedAt]);
  summary.addRow(['Total orders', payload.totals.orderCount]);
  summary.addRow(['Completed', payload.totals.completedCount]);
  summary.addRow(['Source volume', payload.totals.sourceVolume]);
  summary.addRow(['Target volume', payload.totals.targetVolume]);
  summary.addRow(['Fees', payload.totals.feeVolume]);
  summary.addRow(['Completed target', payload.totals.completedTargetVolume]);
  summary.addRow(['Completed fees', payload.totals.completedFees]);

  const dailySheet = workbook.addWorksheet('Daily');
  dailySheet.addRow(['Date', 'Orders', 'Source', 'Target', 'Fees', 'Completed']);
  dailySheet.getRow(1).font = { bold: true };
  for (const day of payload.daily) {
    dailySheet.addRow([
      day.date,
      day.orderCount,
      day.sourceVolume,
      day.targetVolume,
      day.feeVolume,
      day.completedCount
    ]);
  }

  const { headers, data } = ledgerRowsToTable(payload.rows);
  const detail = workbook.addWorksheet('Transactions');
  detail.addRow(headers);
  detail.getRow(1).font = { bold: true };
  for (const row of data) detail.addRow(row);

  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(Buffer.from(buffer));
}

export function ledgerRowsToTable(rows: LedgerExportRow[]) {
  const headers = [
    'ID',
    'Date',
    'Customer',
    'Email',
    'Beneficiary',
    'Corridor',
    'Source',
    'Target',
    'Fee',
    'Status',
    'Proofs'
  ];
  const data = rows.map((row) => [
    row.id,
    row.createdAt,
    row.customerName,
    row.customerEmail,
    row.beneficiaryName,
    row.corridor,
    row.sourceAmount,
    row.targetAmount,
    row.feeAmount,
    row.status,
    row.paymentProofs
  ]);
  return { headers, data };
}
