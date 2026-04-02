import type { AdminReportKey } from 'shared/api/admin-types';

export type ReportFilterKey =
  | 'paymentMethod'
  | 'status'
  | 'hall'
  | 'category'
  | 'cashDesk'
  | 'cashier'
  | 'differenceOnly';
export type ReportKind = 'summary' | 'table';
export type ReportSortDirection = 'asc' | 'desc';

export type ReportDefinition = {
  key: AdminReportKey;
  kind: ReportKind;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  exportPath: string;
  availableFilters: ReportFilterKey[];
  requiredPermissionCode?: string;
  defaultSort?: {
    field: string;
    sort: ReportSortDirection;
  };
};

export const REPORTS_REGISTRY: ReportDefinition[] = [
  {
    key: 'summary',
    kind: 'summary',
    titleKey: 'reports.summary.title',
    descriptionKey: 'reports.summary.description',
    icon: 'solar:chart-square-bold-duotone',
    exportPath: '/api/v1/admin/reports/summary/export/',
    availableFilters: [],
  },
  {
    key: 'sales',
    kind: 'table',
    titleKey: 'reports.sales.title',
    descriptionKey: 'reports.sales.description',
    icon: 'solar:wallet-money-bold-duotone',
    exportPath: '/api/v1/admin/reports/sales/export/',
    availableFilters: ['paymentMethod'],
    defaultSort: { field: 'method', sort: 'asc' },
  },
  {
    key: 'openChecks',
    kind: 'table',
    titleKey: 'reports.openChecks.title',
    descriptionKey: 'reports.openChecks.description',
    icon: 'solar:bill-list-bold-duotone',
    exportPath: '/api/v1/admin/reports/open-checks/export/',
    availableFilters: ['status', 'hall'],
    defaultSort: { field: 'createdAt', sort: 'desc' },
  },
  {
    key: 'topItems',
    kind: 'table',
    titleKey: 'reports.topItems.title',
    descriptionKey: 'reports.topItems.description',
    icon: 'solar:cup-hot-bold-duotone',
    exportPath: '/api/v1/admin/reports/top-items/export/',
    availableFilters: ['category'],
    defaultSort: { field: 'quantity', sort: 'desc' },
  },
  {
    key: 'topStaff',
    kind: 'table',
    titleKey: 'reports.topStaff.title',
    descriptionKey: 'reports.topStaff.description',
    icon: 'solar:users-group-rounded-bold-duotone',
    exportPath: '/api/v1/admin/reports/top-staff/export/',
    availableFilters: [],
    defaultSort: { field: 'totalSales', sort: 'desc' },
  },
  {
    key: 'paymentBreakdown',
    kind: 'table',
    titleKey: 'reports.paymentBreakdown.title',
    descriptionKey: 'reports.paymentBreakdown.description',
    icon: 'solar:card-bold-duotone',
    exportPath: '/api/v1/admin/reports/payment-breakdown/export/',
    availableFilters: ['paymentMethod'],
    defaultSort: { field: 'total', sort: 'desc' },
  },
  {
    key: 'shifts',
    kind: 'table',
    titleKey: 'reports.shifts.title',
    descriptionKey: 'reports.shifts.description',
    icon: 'solar:hourglass-bold-duotone',
    exportPath: '/api/v1/admin/reports/shifts/export/',
    availableFilters: ['status', 'cashDesk', 'cashier', 'differenceOnly'],
    defaultSort: { field: 'openedAt', sort: 'desc' },
  },
];

export const DEFAULT_REPORT_KEY: AdminReportKey = 'summary';

export const getReportDefinition = (reportKey: string | undefined) =>
  REPORTS_REGISTRY.find((report) => report.key === reportKey) ?? REPORTS_REGISTRY[0];
