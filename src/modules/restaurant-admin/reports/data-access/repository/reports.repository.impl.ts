import { apiClient } from 'shared/api/http/apiClient';

import type { ReportsRepository } from '../../domain';

export const reportsRepository: ReportsRepository = {
  getSummary(params) {
    return apiClient.getAdminReportSummary(params);
  },

  exportSummary(params) {
    return apiClient.exportAdminReportSummary(params);
  },

  getSales(params) {
    return apiClient.getAdminSalesReport(params);
  },

  exportSales(params) {
    return apiClient.exportAdminSalesReport(params);
  },

  getOpenChecks(params) {
    return apiClient.getAdminOpenChecksReport(params);
  },

  exportOpenChecks(params) {
    return apiClient.exportAdminOpenChecksReport(params);
  },

  getReceipts(params) {
    return apiClient.getAdminReceiptsReport(params);
  },

  exportReceipts(params) {
    return apiClient.exportAdminReceiptsReport(params);
  },

  getTopItems(params) {
    return apiClient.getAdminTopItemsReport(params);
  },

  exportTopItems(params) {
    return apiClient.exportAdminTopItemsReport(params);
  },

  getTopStaff(params) {
    return apiClient.getAdminTopStaffReport(params);
  },

  exportTopStaff(params) {
    return apiClient.exportAdminTopStaffReport(params);
  },

  getPaymentBreakdown(params) {
    return apiClient.getAdminPaymentBreakdownReport(params);
  },

  exportPaymentBreakdown(params) {
    return apiClient.exportAdminPaymentBreakdownReport(params);
  },

  getShifts(params) {
    return apiClient.getAdminShiftReport(params);
  },

  exportShifts(params) {
    return apiClient.exportAdminShiftReport(params);
  },
};
