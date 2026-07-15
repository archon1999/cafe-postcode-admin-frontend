/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReportDefinition } from '../../domain';

const mocks = vi.hoisted(() => {
  const queryState = {
    data: { data: [], total: 0 },
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  };

  return {
    exportReceipts: vi.fn(),
    receiptsQuery: vi.fn(() => queryState),
    queryState,
  };
});

vi.mock('app/providers/locales', () => ({
  getDataGridLocaleText: () => ({}),
  useTranslate: () => ({
    currentLang: { value: 'uz' },
    t: (key: string) => key,
  }),
}));

vi.mock('modules/restaurant-admin/catalog/application', () => ({
  useGetCatalogCategoriesQuery: () => ({ data: [] }),
}));

vi.mock('modules/restaurant-admin/restaurant-management/application', () => ({
  useGetCashDesksQuery: () => ({ data: [] }),
}));

vi.mock('modules/user-management/users/application', () => ({
  useGetUsersQuery: () => ({ data: { data: [] } }),
}));

vi.mock('../../application', () => ({
  useGetPaymentBreakdownReportQuery: () => mocks.queryState,
  useGetReceiptsReportQuery: mocks.receiptsQuery,
  useGetSalesReportQuery: () => mocks.queryState,
  useGetShiftReportQuery: () => mocks.queryState,
  useGetTopItemsReportQuery: () => mocks.queryState,
  useGetTopStaffReportQuery: () => mocks.queryState,
}));

vi.mock('../../data-access', () => ({
  reportsRepository: {
    exportPaymentBreakdown: vi.fn(),
    exportReceipts: mocks.exportReceipts,
    exportSales: vi.fn(),
    exportShifts: vi.fn(),
    exportTopItems: vi.fn(),
    exportTopStaff: vi.fn(),
  },
}));

vi.mock('shared/utils/download', () => ({
  downloadBlob: vi.fn(),
}));

vi.mock('shared/ui/CustomDataGrid', () => ({
  DataGridColumnsDialogButton: () => null,
}));

vi.mock('./ReportsHeaderCard', () => ({
  ReportsHeaderCard: ({ onExport }: { onExport: () => void }) => (
    <button type="button" data-testid="report-export" onClick={onExport} />
  ),
}));

vi.mock('./ReportTableCard', () => ({
  ReportTableCard: () => null,
}));

import { ReportsTableSection } from './ReportsTableSection';

const receiptReport: ReportDefinition = {
  key: 'receipts',
  kind: 'table',
  titleKey: 'reports.receipts.title',
  descriptionKey: 'reports.receipts.description',
  icon: 'receipt',
  exportPath: '/receipts/export',
  availableFilters: ['receiptKind', 'status'],
};

const commonRequestParams = {
  startDate: '2026-07-01',
  endDate: '2026-07-15',
  search: undefined,
  ordering: undefined,
};

beforeEach(() => {
  mocks.exportReceipts.mockResolvedValue({
    blob: new Blob(['receipts']),
    filename: 'receipts.csv',
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderReceipts(status?: 'created' | 'sent' | 'failed') {
  render(
    <ReportsTableSection
      report={receiptReport}
      startDate={commonRequestParams.startDate}
      endDate={commonRequestParams.endDate}
      activePreset="today"
      search=""
      paymentMethods={[]}
      receiptKinds={[]}
      statuses={status ? [status] : []}
      categoryIds={[]}
      cashDeskIds={[]}
      cashierIds={[]}
      differenceOnly={[]}
      paginationModel={{ page: 0, pageSize: 25 }}
      sortModel={[]}
      columnVisibilityModel={{}}
      onPresetChange={vi.fn()}
      onRangeChange={vi.fn()}
      onSearchChange={vi.fn()}
      onClearSearch={vi.fn()}
      onPaymentMethodsChange={vi.fn()}
      onReceiptKindsChange={vi.fn()}
      onStatusesChange={vi.fn()}
      onCategoryIdsChange={vi.fn()}
      onCashDeskIdsChange={vi.fn()}
      onCashierIdsChange={vi.fn()}
      onDifferenceOnlyChange={vi.fn()}
      onPaginationModelChange={vi.fn()}
      onSortModelChange={vi.fn()}
      onColumnVisibilityModelChange={vi.fn()}
    />,
  );
}

describe('ReportsTableSection receipt status parameters', () => {
  it.each([
    ['empty', undefined],
    ['created', 'created'],
    ['sent', 'sent'],
    ['failed', 'failed'],
  ] as const)('passes the %s status unchanged to query and export', async (_label, status) => {
    renderReceipts(status);

    expect(mocks.receiptsQuery).toHaveBeenLastCalledWith(
      {
        ...commonRequestParams,
        page: 1,
        pageSize: 25,
        status,
        receiptKind: undefined,
      },
      { enabled: true },
    );

    fireEvent.click(screen.getByTestId('report-export'));

    await waitFor(() => {
      expect(mocks.exportReceipts).toHaveBeenCalledWith({
        ...commonRequestParams,
        status,
        receiptKind: undefined,
      });
    });
  });
});
