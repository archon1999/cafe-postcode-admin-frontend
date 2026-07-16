import type {
  AdminPaymentBreakdownReportQueryParams,
  AdminReceiptsReportQueryParams,
  AdminSalesReportQueryParams,
  AdminShiftReportQueryParams,
  AdminTopItemsReportQueryParams,
  AdminTopStaffReportQueryParams,
} from 'shared/api/admin-types';

import {
  useGetPaymentBreakdownReportQuery,
  useGetReceiptsReportQuery,
  useGetSalesReportQuery,
  useGetShiftReportQuery,
  useGetTopItemsReportQuery,
  useGetTopStaffReportQuery,
} from '../../application';

import type { TableReportKey } from './reportTableColumns';

type UseReportTableQueryParams = {
  reportKey: TableReportKey;
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
  search?: string;
  ordering?: string;
  paymentMethod?: string;
  receiptKind?: 'plain' | 'fiscal';
  receiptStatus?: AdminReceiptsReportQueryParams['status'];
  categoryId?: string;
  cashDeskId?: string;
  cashierId?: string;
  shiftStatus?: string;
  differenceOnly: boolean;
};

export function useReportTableQuery({
  reportKey,
  startDate,
  endDate,
  page,
  pageSize,
  search,
  ordering,
  paymentMethod,
  receiptKind,
  receiptStatus,
  categoryId,
  cashDeskId,
  cashierId,
  shiftStatus,
  differenceOnly,
}: UseReportTableQueryParams) {
  const period = { startDate, endDate };
  const pagination = { page, pageSize };

  const salesQuery = useGetSalesReportQuery(
    {
      ...period,
      ...pagination,
      search,
      paymentMethod,
      ordering,
    } satisfies AdminSalesReportQueryParams,
    { enabled: reportKey === 'sales' },
  );
  const receiptsQuery = useGetReceiptsReportQuery(
    {
      ...period,
      ...pagination,
      search,
      status: receiptStatus,
      receiptKind,
      ordering,
    } satisfies AdminReceiptsReportQueryParams,
    { enabled: reportKey === 'receipts' },
  );
  const topItemsQuery = useGetTopItemsReportQuery(
    {
      ...period,
      ...pagination,
      search,
      categoryId,
      ordering,
    } satisfies AdminTopItemsReportQueryParams,
    { enabled: reportKey === 'topItems' },
  );
  const topStaffQuery = useGetTopStaffReportQuery(
    {
      ...period,
      ...pagination,
      search,
      ordering,
    } satisfies AdminTopStaffReportQueryParams,
    { enabled: reportKey === 'topStaff' },
  );
  const paymentBreakdownQuery = useGetPaymentBreakdownReportQuery(
    {
      ...period,
      ...pagination,
      search,
      paymentMethod,
      ordering,
    } satisfies AdminPaymentBreakdownReportQueryParams,
    { enabled: reportKey === 'paymentBreakdown' },
  );
  const shiftQuery = useGetShiftReportQuery(
    {
      ...period,
      ...pagination,
      search,
      cashDeskId,
      cashierId,
      status: shiftStatus,
      differenceOnly,
      ordering,
    } satisfies AdminShiftReportQueryParams,
    { enabled: reportKey === 'shifts' },
  );

  switch (reportKey) {
    case 'sales':
      return salesQuery;
    case 'receipts':
      return receiptsQuery;
    case 'topItems':
      return topItemsQuery;
    case 'topStaff':
      return topStaffQuery;
    case 'shifts':
      return shiftQuery;
    default:
      return paymentBreakdownQuery;
  }
}
