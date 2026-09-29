import type {
  AdminOpenChecksReportQueryParams,
  AdminOpenChecksReportRow,
  AdminTopCategoryReportRow,
  AdminReceiptsReportQueryParams,
  AdminReceiptsReportRow,
  AdminPaginatedResponse,
  AdminReportPaginatedResponse,
  AdminPaymentBreakdownReportQueryParams,
  AdminPaymentBreakdownReportRow,
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
} from 'shared/api/admin-types';

import type { ZReportQueryParams, ZReportRow } from '../entities';

export interface ReportsRepository {
  getZReports(params: ZReportQueryParams): Promise<AdminReportPaginatedResponse<ZReportRow>>;
  exportZReports(params: ZReportQueryParams): Promise<AdminReportExportFile>;
  getSummary(params: AdminSummaryReportQueryParams): Promise<AdminReportSummary>;
  exportSummary(params: AdminSummaryReportQueryParams): Promise<AdminReportExportFile>;
  getSales(params: AdminSalesReportQueryParams): Promise<AdminReportPaginatedResponse<AdminSalesReportRow>>;
  exportSales(params: AdminSalesReportQueryParams): Promise<AdminReportExportFile>;
  getOpenChecks(params: AdminOpenChecksReportQueryParams): Promise<AdminPaginatedResponse<AdminOpenChecksReportRow>>;
  exportOpenChecks(params: AdminOpenChecksReportQueryParams): Promise<AdminReportExportFile>;
  getReceipts(params: AdminReceiptsReportQueryParams): Promise<AdminReportPaginatedResponse<AdminReceiptsReportRow>>;
  exportReceipts(params: AdminReceiptsReportQueryParams): Promise<AdminReportExportFile>;
  getTopItems(
    params: AdminTopItemsReportQueryParams,
  ): Promise<AdminReportPaginatedResponse<AdminTopItemsReportRow | AdminTopCategoryReportRow>>;
  exportTopItems(params: AdminTopItemsReportQueryParams): Promise<AdminReportExportFile>;
  getTopStaff(params: AdminTopStaffReportQueryParams): Promise<AdminReportPaginatedResponse<AdminTopStaffReportRow>>;
  exportTopStaff(params: AdminTopStaffReportQueryParams): Promise<AdminReportExportFile>;
  getPaymentBreakdown(
    params: AdminPaymentBreakdownReportQueryParams,
  ): Promise<AdminReportPaginatedResponse<AdminPaymentBreakdownReportRow>>;
  exportPaymentBreakdown(params: AdminPaymentBreakdownReportQueryParams): Promise<AdminReportExportFile>;
  getShifts(params: AdminShiftReportQueryParams): Promise<AdminReportPaginatedResponse<AdminShiftReportRow>>;
  exportShifts(params: AdminShiftReportQueryParams): Promise<AdminReportExportFile>;
}
