import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

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

import { reportsRepository } from '../data-access';
import type { ZReportRow, ZReportQueryParams } from '../domain';

import { reportsKeys } from './keys';

export function useGetReportSummaryQuery(
  params: AdminSummaryReportQueryParams,
  options?: Omit<UseQueryOptions<AdminReportSummary>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.summary(params),
    queryFn: () => reportsRepository.getSummary(params),
    ...options,
  });
}

export function useGetSalesReportQuery(
  params: AdminSalesReportQueryParams,
  options?: Omit<UseQueryOptions<AdminReportPaginatedResponse<AdminSalesReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.sales(params),
    queryFn: () => reportsRepository.getSales(params),
    ...options,
  });
}

export function useGetOpenChecksReportQuery(
  params: AdminOpenChecksReportQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminOpenChecksReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.openChecks(params),
    queryFn: () => reportsRepository.getOpenChecks(params),
    ...options,
  });
}

export function useGetReceiptsReportQuery(
  params: AdminReceiptsReportQueryParams,
  options?: Omit<UseQueryOptions<AdminReportPaginatedResponse<AdminReceiptsReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.receipts(params),
    queryFn: () => reportsRepository.getReceipts(params),
    ...options,
  });
}

export function useGetTopItemsReportQuery(
  params: AdminTopItemsReportQueryParams,
  options?: Omit<
    UseQueryOptions<AdminReportPaginatedResponse<AdminTopItemsReportRow | AdminTopCategoryReportRow>>,
    'queryFn' | 'queryKey'
  >,
) {
  return useQuery({
    queryKey: reportsKeys.topItems(params),
    queryFn: () => reportsRepository.getTopItems(params),
    ...options,
  });
}

export function useGetTopStaffReportQuery(
  params: AdminTopStaffReportQueryParams,
  options?: Omit<UseQueryOptions<AdminReportPaginatedResponse<AdminTopStaffReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.topStaff(params),
    queryFn: () => reportsRepository.getTopStaff(params),
    ...options,
  });
}

export function useGetPaymentBreakdownReportQuery(
  params: AdminPaymentBreakdownReportQueryParams,
  options?: Omit<UseQueryOptions<AdminReportPaginatedResponse<AdminPaymentBreakdownReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.paymentBreakdown(params),
    queryFn: () => reportsRepository.getPaymentBreakdown(params),
    ...options,
  });
}

export function useGetShiftReportQuery(
  params: AdminShiftReportQueryParams,
  options?: Omit<UseQueryOptions<AdminReportPaginatedResponse<AdminShiftReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.shifts(params),
    queryFn: () => reportsRepository.getShifts(params),
    ...options,
  });
}

export function useGetZReportsQuery(
  params: ZReportQueryParams,
  options?: Omit<UseQueryOptions<AdminReportPaginatedResponse<ZReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.zReports(params),
    queryFn: () => reportsRepository.getZReports(params),
    ...options,
  });
}
