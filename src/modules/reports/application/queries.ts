import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  AdminOpenChecksReportQueryParams,
  AdminOpenChecksReportRow,
  AdminPaginatedResponse,
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
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminSalesReportRow>>, 'queryFn' | 'queryKey'>,
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

export function useGetTopItemsReportQuery(
  params: AdminTopItemsReportQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminTopItemsReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.topItems(params),
    queryFn: () => reportsRepository.getTopItems(params),
    ...options,
  });
}

export function useGetTopStaffReportQuery(
  params: AdminTopStaffReportQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminTopStaffReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.topStaff(params),
    queryFn: () => reportsRepository.getTopStaff(params),
    ...options,
  });
}

export function useGetPaymentBreakdownReportQuery(
  params: AdminPaymentBreakdownReportQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminPaymentBreakdownReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.paymentBreakdown(params),
    queryFn: () => reportsRepository.getPaymentBreakdown(params),
    ...options,
  });
}

export function useGetShiftReportQuery(
  params: AdminShiftReportQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminShiftReportRow>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: reportsKeys.shifts(params),
    queryFn: () => reportsRepository.getShifts(params),
    ...options,
  });
}
