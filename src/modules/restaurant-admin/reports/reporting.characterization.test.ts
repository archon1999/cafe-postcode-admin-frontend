import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiClientMock } = vi.hoisted(() => ({
  apiClientMock: {
    getAdminReportSummary: vi.fn(),
    exportAdminReportSummary: vi.fn(),
    getAdminSalesReport: vi.fn(),
    exportAdminSalesReport: vi.fn(),
  },
}));

vi.mock('shared/api/http/apiClient', () => ({ apiClient: apiClientMock }));

import { reportsRepository } from './data-access';
import { DEFAULT_REPORT_KEY, getReportDefinition, REPORTS_REGISTRY } from './domain';

describe('Admin reporting characterization', () => {
  beforeEach(() => {
    Object.values(apiClientMock).forEach((mock) => mock.mockReset());
  });

  it('keeps the visible report registry, filters and export routes stable', () => {
    expect(DEFAULT_REPORT_KEY).toBe('summary');
    expect(
      REPORTS_REGISTRY.map(({ key, kind, exportPath, availableFilters }) => ({
        key,
        kind,
        exportPath,
        availableFilters,
      })),
    ).toEqual([
      {
        key: 'summary',
        kind: 'summary',
        exportPath: '/api/v1/admin/reporting/summary/export/',
        availableFilters: [],
      },
      {
        key: 'sales',
        kind: 'table',
        exportPath: '/api/v1/admin/reporting/sales/export/',
        availableFilters: ['paymentMethod'],
      },
      {
        key: 'receipts',
        kind: 'table',
        exportPath: '/api/v1/admin/reporting/receipts/export/',
        availableFilters: ['receiptKind', 'status'],
      },
      {
        key: 'topItems',
        kind: 'table',
        exportPath: '/api/v1/admin/reporting/top-items/export/',
        availableFilters: ['category'],
      },
      {
        key: 'topStaff',
        kind: 'table',
        exportPath: '/api/v1/admin/reporting/top-staff/export/',
        availableFilters: [],
      },
      {
        key: 'shifts',
        kind: 'table',
        exportPath: '/api/v1/admin/reporting/shifts/export/',
        availableFilters: ['status', 'cashDesk', 'cashier', 'differenceOnly'],
      },
    ]);
    expect(getReportDefinition('unknown').key).toBe('summary');
  });

  it('passes the same date/filter contract to table data and export calls', async () => {
    const summaryParams = { startDate: '2026-04-01', endDate: '2026-04-07' };
    const salesParams = { ...summaryParams, page: 2, pageSize: 25, paymentMethod: 'card' };
    const summary = {
      grossSalesTotal: 12_000,
      refundsTotal: 2_000,
      salesTotal: 10_000,
      ordersCount: 2,
      averageCheck: 5_000,
      prechecksCount: 1,
      receiptsCount: 1,
    };
    const sales = { count: 1, data: [{ method: 'card', count: 2, total: 10_000 }] };
    const exported = { blob: {} as Blob, filename: 'sales-report.xlsx' };
    apiClientMock.getAdminReportSummary.mockResolvedValue(summary);
    apiClientMock.getAdminSalesReport.mockResolvedValue(sales);
    apiClientMock.exportAdminSalesReport.mockResolvedValue(exported);

    await expect(reportsRepository.getSummary(summaryParams)).resolves.toBe(summary);
    await expect(reportsRepository.getSales(salesParams)).resolves.toBe(sales);
    await expect(reportsRepository.exportSales(salesParams)).resolves.toBe(exported);
    expect(apiClientMock.getAdminReportSummary).toHaveBeenCalledWith(summaryParams);
    expect(apiClientMock.getAdminSalesReport).toHaveBeenCalledWith(salesParams);
    expect(apiClientMock.exportAdminSalesReport).toHaveBeenCalledWith(salesParams);
  });
});
