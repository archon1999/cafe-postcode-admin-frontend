/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AdminReceiptsReportRow } from 'shared/api/admin-types';

import { getReportTableColumns, type ReportsTranslate } from './reportTableColumns';

vi.mock('app/providers/locales', () => ({ useTranslate: vi.fn() }));
vi.mock('shared/ui/Iconify', () => ({ Iconify: () => <span /> }));

afterEach(cleanup);

const t = ((key: string) => key) as ReportsTranslate;
const receipt: AdminReceiptsReportRow = {
  id: 'receipt-1',
  orderNumber: 12536,
  orderDisplayName: '84',
  kind: 'fiscal',
  status: 'sent',
  amount: 10000,
  createdAt: '2026-10-15T10:00:00Z',
  qrCodeUrl: 'https://ofd.soliq.uz/check?r=84',
};

function renderCell(field: string, row = receipt) {
  const column = getReportTableColumns('receipts', t).find((item) => item.field === field)!;
  render(<>{column.renderCell!({ row, tabIndex: 0 } as GridRenderCellParams)}</>);
}

describe('receipt report identity and QR link', () => {
  it('shows the order ID and receipt display number on separate lines', () => {
    renderCell('orderNumber');
    expect(screen.getByText('ID 12536')).toBeVisible();
    expect(screen.getByText('84')).toBeVisible();
  });

  it('opens the fiscal QR in a separate tab', () => {
    renderCell('status');
    const link = screen.getByRole('link', { name: 'reports.receipts.openFiscalQr' });
    expect(link).toHaveAttribute('href', receipt.qrCodeUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('receiptStatuses.sent')).toBeVisible();
  });

  it.each([{ kind: 'plain' as const }, { qrCodeUrl: null }, { qrCodeUrl: 'javascript:alert(1)' }])(
    'does not show an unavailable fiscal QR action: %j',
    (overrides) => {
      renderCell('status', { ...receipt, ...overrides });
      expect(screen.queryByRole('link')).toBeNull();
    },
  );
});
