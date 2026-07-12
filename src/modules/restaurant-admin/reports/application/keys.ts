import { createKeyFactory } from 'shared/api';

const reportsBaseKeys = createKeyFactory('reports');
const summaryKeys = createKeyFactory('reports', 'summary');
const salesKeys = createKeyFactory('reports', 'sales');
const openChecksKeys = createKeyFactory('reports', 'openChecks');
const receiptsKeys = createKeyFactory('reports', 'receipts');
const topItemsKeys = createKeyFactory('reports', 'topItems');
const topStaffKeys = createKeyFactory('reports', 'topStaff');
const paymentBreakdownKeys = createKeyFactory('reports', 'paymentBreakdown');
const shiftsKeys = createKeyFactory('reports', 'shifts');

export const reportsKeys = {
  all: reportsBaseKeys.all,
  summary: summaryKeys.params,
  sales: salesKeys.params,
  openChecks: openChecksKeys.params,
  receipts: receiptsKeys.params,
  topItems: topItemsKeys.params,
  topStaff: topStaffKeys.params,
  paymentBreakdown: paymentBreakdownKeys.params,
  shifts: shiftsKeys.params,
} as const;
