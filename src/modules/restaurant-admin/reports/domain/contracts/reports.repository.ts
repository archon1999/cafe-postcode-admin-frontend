import type {
  AdminOpenChecksReportQueryParams,
  AdminOpenChecksReportRow,
  AdminReceiptsReportQueryParams,
  AdminReceiptsReportRow,
  AdminPaginatedResponse,
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

export interface ReportsRepository {
  getSummary(params: AdminSummaryReportQueryParams): Promise<AdminReportSummary>;
  exportSummary(params: AdminSummaryReportQueryParams): Promise<AdminReportExportFile>;
  getSales(params: AdminSalesReportQueryParams): Promise<AdminPaginatedResponse<AdminSalesReportRow>>;
  exportSales(params: AdminSalesReportQueryParams): Promise<AdminReportExportFile>;
  getOpenChecks(params: AdminOpenChecksReportQueryParams): Promise<AdminPaginatedResponse<AdminOpenChecksReportRow>>;
  exportOpenChecks(params: AdminOpenChecksReportQueryParams): Promise<AdminReportExportFile>;
  getReceipts(params: AdminReceiptsReportQueryParams): Promise<AdminPaginatedResponse<AdminReceiptsReportRow>>;
  exportReceipts(params: AdminReceiptsReportQueryParams): Promise<AdminReportExportFile>;
  getTopItems(params: AdminTopItemsReportQueryParams): Promise<AdminPaginatedResponse<AdminTopItemsReportRow>>;
  exportTopItems(params: AdminTopItemsReportQueryParams): Promise<AdminReportExportFile>;
  getTopStaff(params: AdminTopStaffReportQueryParams): Promise<AdminPaginatedResponse<AdminTopStaffReportRow>>;
  exportTopStaff(params: AdminTopStaffReportQueryParams): Promise<AdminReportExportFile>;
  getPaymentBreakdown(
    params: AdminPaymentBreakdownReportQueryParams,
  ): Promise<AdminPaginatedResponse<AdminPaymentBreakdownReportRow>>;
  exportPaymentBreakdown(params: AdminPaymentBreakdownReportQueryParams): Promise<AdminReportExportFile>;
  getShifts(params: AdminShiftReportQueryParams): Promise<AdminPaginatedResponse<AdminShiftReportRow>>;
  exportShifts(params: AdminShiftReportQueryParams): Promise<AdminReportExportFile>;
}
