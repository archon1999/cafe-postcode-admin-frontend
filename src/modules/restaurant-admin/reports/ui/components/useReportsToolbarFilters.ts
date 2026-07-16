import type { GridPaginationModel } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { useGetCatalogCategoriesQuery } from 'modules/restaurant-admin/catalog/application';
import { useGetCashDesksQuery } from 'modules/restaurant-admin/restaurant-management/application';
import { useGetUsersQuery } from 'modules/user-management/users/application';
import type { FilterOption } from 'shared/ui/Filters';

import type { ReportDefinition } from '../../domain';

import type { ReportsToolbarFilter } from './ReportsToolbar';

type FilterValueProps = {
  paymentMethods: string[];
  receiptKinds: string[];
  statuses: string[];
  categoryIds: string[];
  cashDeskIds: string[];
  cashierIds: string[];
  differenceOnly: string[];
  onPaymentMethodsChange: (values: string[]) => void;
  onReceiptKindsChange: (values: string[]) => void;
  onStatusesChange: (values: string[]) => void;
  onCategoryIdsChange: (values: string[]) => void;
  onCashDeskIdsChange: (values: string[]) => void;
  onCashierIdsChange: (values: string[]) => void;
  onDifferenceOnlyChange: (values: string[]) => void;
};

type UseReportsToolbarFiltersParams = FilterValueProps & {
  report: ReportDefinition;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
};

type FilterDefinition = {
  enabled: boolean;
  label: string;
  value: string[];
  options: FilterOption[];
  onChange: (values: string[]) => void;
  testId: string;
};

const singleSelection = (values: string[]) => values.slice(-1);

export function useReportsToolbarFilters({
  report,
  paginationModel,
  onPaginationModelChange,
  paymentMethods,
  receiptKinds,
  statuses,
  categoryIds,
  cashDeskIds,
  cashierIds,
  differenceOnly,
  onPaymentMethodsChange,
  onReceiptKindsChange,
  onStatusesChange,
  onCategoryIdsChange,
  onCashDeskIdsChange,
  onCashierIdsChange,
  onDifferenceOnlyChange,
}: UseReportsToolbarFiltersParams) {
  const { t } = useTranslate('reports');
  const categoriesQuery = useGetCatalogCategoriesQuery({ enabled: report.key === 'topItems' });
  const cashDesksQuery = useGetCashDesksQuery({ enabled: report.key === 'shifts' });
  const cashiersQuery = useGetUsersQuery(
    { page: 1, pageSize: 100, employmentStatusIn: 'active' },
    { enabled: report.key === 'shifts' },
  );

  const paymentMethodOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'cash', label: t('paymentMethods.cash') },
      { value: 'card', label: t('paymentMethods.card') },
      { value: 'qr', label: t('paymentMethods.qr') },
      { value: 'mixed', label: t('paymentMethods.mixed') },
    ],
    [t],
  );
  const statusOptions = useMemo<FilterOption[]>(
    () =>
      report.key === 'receipts'
        ? [
            { value: 'created', label: t('receiptStatuses.created') },
            { value: 'sent', label: t('receiptStatuses.sent') },
            { value: 'failed', label: t('receiptStatuses.failed') },
          ]
        : report.key === 'shifts'
          ? [
              { value: 'open', label: t('statuses.open') },
              { value: 'closed', label: t('statuses.closed') },
            ]
          : [
              { value: 'open', label: t('statuses.open') },
              { value: 'submitted', label: t('statuses.submitted') },
              { value: 'ready', label: t('statuses.ready') },
            ],
    [report.key, t],
  );
  const receiptKindOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'plain', label: t('receiptKinds.precheck') },
      { value: 'fiscal', label: t('receiptKinds.receipt') },
    ],
    [t],
  );
  const categoryOptions = useMemo<FilterOption[]>(
    () => (categoriesQuery.data ?? []).map((category) => ({ value: category.id, label: category.name })),
    [categoriesQuery.data],
  );
  const cashDeskOptions = useMemo<FilterOption[]>(
    () => (cashDesksQuery.data ?? []).map((cashDesk) => ({ value: cashDesk.id, label: cashDesk.name })),
    [cashDesksQuery.data],
  );
  const cashierOptions = useMemo<FilterOption[]>(
    () => (cashiersQuery.data?.data ?? []).map((user) => ({ value: user.id, label: user.fullName })),
    [cashiersQuery.data?.data],
  );

  return useMemo<ReportsToolbarFilter[]>(() => {
    const definitions: FilterDefinition[] = [
      {
        enabled: report.availableFilters.includes('paymentMethod'),
        label: t('filters.paymentMethod'),
        value: paymentMethods,
        options: paymentMethodOptions,
        onChange: onPaymentMethodsChange,
        testId: 'reports-payment-method-filter',
      },
      {
        enabled: report.availableFilters.includes('receiptKind'),
        label: t('filters.receiptKind'),
        value: receiptKinds,
        options: receiptKindOptions,
        onChange: onReceiptKindsChange,
        testId: 'reports-receipt-kind-filter',
      },
      {
        enabled: report.availableFilters.includes('status'),
        label: t('filters.status'),
        value: statuses,
        options: statusOptions,
        onChange: onStatusesChange,
        testId: 'reports-status-filter',
      },
      {
        enabled: report.availableFilters.includes('category'),
        label: t('filters.category'),
        value: categoryIds,
        options: categoryOptions,
        onChange: onCategoryIdsChange,
        testId: 'reports-category-filter',
      },
      {
        enabled: report.availableFilters.includes('cashDesk'),
        label: t('filters.cashDesk'),
        value: cashDeskIds,
        options: cashDeskOptions,
        onChange: onCashDeskIdsChange,
        testId: 'reports-cash-desk-filter',
      },
      {
        enabled: report.availableFilters.includes('cashier'),
        label: t('filters.cashier'),
        value: cashierIds,
        options: cashierOptions,
        onChange: onCashierIdsChange,
        testId: 'reports-cashier-filter',
      },
      {
        enabled: report.availableFilters.includes('differenceOnly'),
        label: t('filters.differenceOnly'),
        value: differenceOnly,
        options: [{ value: 'difference-only', label: t('filters.onlyDifferences') }],
        onChange: onDifferenceOnlyChange,
        testId: 'reports-difference-only-filter',
      },
    ];

    return definitions
      .filter(({ enabled }) => enabled)
      .map(({ enabled: _enabled, ...definition }) => ({
        ...definition,
        emptyLabel: t('filters.all'),
        onChange: (values: string[]) => definition.onChange(singleSelection(values)),
        onApply: (values: string[]) => {
          definition.onChange(singleSelection(values));
          onPaginationModelChange({ ...paginationModel, page: 0 });
        },
      }));
  }, [
    cashDeskIds,
    cashDeskOptions,
    cashierIds,
    cashierOptions,
    categoryIds,
    categoryOptions,
    differenceOnly,
    onCashDeskIdsChange,
    onCashierIdsChange,
    onCategoryIdsChange,
    onDifferenceOnlyChange,
    onPaginationModelChange,
    onPaymentMethodsChange,
    onReceiptKindsChange,
    onStatusesChange,
    paginationModel,
    paymentMethodOptions,
    paymentMethods,
    receiptKindOptions,
    receiptKinds,
    report.availableFilters,
    statusOptions,
    statuses,
    t,
  ]);
}
