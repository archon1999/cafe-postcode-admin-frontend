import type {
  AdminOpenChecksReportQueryParams,
  AdminOpenChecksReportRow,
  AdminPaginatedResponse,
  AdminPaymentBreakdownReportQueryParams,
  AdminPaymentBreakdownReportRow,
  AdminReceiptsReportQueryParams,
  AdminReceiptsReportRow,
  AdminReportExportFile,
  AdminReportSummary,
  AdminSalesReportQueryParams,
  AdminSalesReportRow,
  AdminShiftReportQueryParams,
  AdminShiftReportRow,
  AdminSummaryReportQueryParams,
  AdminTopItemsReportQueryParams,
  AdminTopItemsReportRow,
  AdminTopStaffReportQueryParams,
  AdminTopStaffReportRow,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

type ReportQueryParams = {
  startDate?: string;
  endDate?: string;
  search?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
  paymentMethod?: string;
  receiptKind?: string;
  status?: string;
  hallId?: string;
  categoryId?: string;
  cashDeskId?: string;
  cashierId?: string;
  differenceOnly?: boolean;
};

function mapReportParams(params: ReportQueryParams) {
  return {
    startDate: params.startDate,
    endDate: params.endDate,
    search: params.search,
    ordering: params.ordering,
    page: params.page,
    pageSize: params.pageSize,
    paymentMethod: params.paymentMethod,
    receiptKind: params.receiptKind,
    status: params.status,
    hallId: params.hallId,
    categoryId: params.categoryId,
    cashDeskId: params.cashDeskId,
    cashierId: params.cashierId,
    differenceOnly: params.differenceOnly,
  };
}

function extractFilename(disposition?: string | null, fallback = 'report.xlsx') {
  if (!disposition) {
    return fallback;
  }

  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] ? decodeURIComponent(match[1]) : fallback;
}

function getPaginatedReport<Row>(path: string, params: ReportQueryParams) {
  return instance
    .get<AdminPaginatedResponse<Row>>(path, { params: mapReportParams(params) })
    .then((response) => response.data);
}

function exportReport(path: string, params: ReportQueryParams, fallbackFilename: string) {
  return instance
    .get<Blob>(path, { params: mapReportParams(params), responseType: 'blob' })
    .then<AdminReportExportFile>((response) => ({
      blob: response.data,
      filename: extractFilename(response.headers['content-disposition'], fallbackFilename),
    }));
}

export const adminReportGateway = {
  getAdminReportSummary(params: AdminSummaryReportQueryParams) {
    return instance
      .get<AdminReportSummary>('/api/v1/admin/reporting/summary/', { params: mapReportParams(params) })
      .then((response) => response.data);
  },

  exportAdminReportSummary(params: AdminSummaryReportQueryParams) {
    return exportReport('/api/v1/admin/reporting/summary/export/', params, 'summary-report.xlsx');
  },

  getAdminSalesReport(params: AdminSalesReportQueryParams) {
    return getPaginatedReport<AdminSalesReportRow>('/api/v1/admin/reporting/sales/', params);
  },

  exportAdminSalesReport(params: AdminSalesReportQueryParams) {
    return exportReport('/api/v1/admin/reporting/sales/export/', params, 'sales-report.xlsx');
  },

  getAdminOpenChecksReport(params: AdminOpenChecksReportQueryParams) {
    return getPaginatedReport<AdminOpenChecksReportRow>('/api/v1/admin/reporting/open-checks/', params);
  },

  exportAdminOpenChecksReport(params: AdminOpenChecksReportQueryParams) {
    return exportReport('/api/v1/admin/reporting/open-checks/export/', params, 'open-checks-report.xlsx');
  },

  getAdminReceiptsReport(params: AdminReceiptsReportQueryParams) {
    return getPaginatedReport<AdminReceiptsReportRow>('/api/v1/admin/reporting/receipts/', params);
  },

  exportAdminReceiptsReport(params: AdminReceiptsReportQueryParams) {
    return exportReport('/api/v1/admin/reporting/receipts/export/', params, 'receipts-report.xlsx');
  },

  getAdminTopItemsReport(params: AdminTopItemsReportQueryParams) {
    return getPaginatedReport<AdminTopItemsReportRow>('/api/v1/admin/reporting/top-items/', params);
  },

  exportAdminTopItemsReport(params: AdminTopItemsReportQueryParams) {
    return exportReport('/api/v1/admin/reporting/top-items/export/', params, 'top-items-report.xlsx');
  },

  getAdminTopStaffReport(params: AdminTopStaffReportQueryParams) {
    return getPaginatedReport<AdminTopStaffReportRow>('/api/v1/admin/reporting/top-staff/', params);
  },

  exportAdminTopStaffReport(params: AdminTopStaffReportQueryParams) {
    return exportReport('/api/v1/admin/reporting/top-staff/export/', params, 'top-staff-report.xlsx');
  },

  getAdminPaymentBreakdownReport(params: AdminPaymentBreakdownReportQueryParams) {
    return getPaginatedReport<AdminPaymentBreakdownReportRow>('/api/v1/admin/reporting/payment-breakdown/', params);
  },

  exportAdminPaymentBreakdownReport(params: AdminPaymentBreakdownReportQueryParams) {
    return exportReport('/api/v1/admin/reporting/payment-breakdown/export/', params, 'payment-breakdown-report.xlsx');
  },

  getAdminShiftReport(params: AdminShiftReportQueryParams) {
    return getPaginatedReport<AdminShiftReportRow>('/api/v1/admin/reporting/shifts/', params);
  },

  exportAdminShiftReport(params: AdminShiftReportQueryParams) {
    return exportReport('/api/v1/admin/reporting/shifts/export/', params, 'shift-report.xlsx');
  },
};
