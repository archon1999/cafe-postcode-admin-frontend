import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { GridSortModel } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper, canAccessReports } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import type { AdminReportKey } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import { useParams, useRouter } from 'shared/hooks/router';
import { useDataGridPreferences } from 'shared/hooks/use-data-grid-preferences';
import { usePageTitle } from 'shared/hooks/use-page-title';
import { StorageService } from 'shared/lib/storage';

import { DEFAULT_REPORT_KEY, getReportDefinition, REPORTS_REGISTRY } from '../../../domain';
import {
  createCustomRangeState,
  createPresetRangeState,
  isReportsDatePreset,
  isValidReportsDate,
  type ReportsFixedDatePreset,
  type ReportsDateRangeState,
} from '../../components/reportsDateRange';
import { ReportsMobileTabs } from '../../components/ReportsMobileTabs';
import { ReportsSidebar } from '../../components/ReportsSidebar';
import { ReportsSummarySection } from '../../components/ReportsSummarySection';
import { ReportsTableSection } from '../../components/ReportsTableSection';

const REPORTS_DATE_RANGE_STORAGE_KEY = 'restaurant-admin-reports-date-range';
const REPORTS_LAST_REPORT_STORAGE_KEY = 'restaurant-admin-reports-last-report';

function getInitialReportsDateRangeState(): ReportsDateRangeState {
  const fallbackState = createPresetRangeState('today');

  if (typeof window === 'undefined') {
    return fallbackState;
  }

  try {
    const parsed = StorageService.getItem<Partial<ReportsDateRangeState>>(REPORTS_DATE_RANGE_STORAGE_KEY);

    if (!parsed) return fallbackState;

    if (
      !isValidReportsDate(parsed.startDate) ||
      !isValidReportsDate(parsed.endDate) ||
      !isReportsDatePreset(parsed.activePreset)
    ) {
      return fallbackState;
    }

    if (parsed.activePreset === 'custom') {
      return createCustomRangeState(parsed.startDate, parsed.endDate);
    }

    return {
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      activePreset: parsed.activePreset,
    };
  } catch {
    return fallbackState;
  }
}

const ReportsPage = () => {
  const { profile } = useCurrentUser();
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const { t } = useTranslate('reports');

  const reportParam = params.reportKey;
  const availableReports = useMemo(
    () =>
      REPORTS_REGISTRY.filter(
        (report) => !report.requiredPermissionCode || profile?.permissionCodes?.includes(report.requiredPermissionCode),
      ),
    [profile?.permissionCodes],
  );
  const availableReportKeys = useMemo(
    () => new Set<AdminReportKey>(availableReports.map((report) => report.key)),
    [availableReports],
  );
  const [lastReportKey, setLastReportKey] = useState<AdminReportKey | null>(() =>
    StorageService.getItem<AdminReportKey>(REPORTS_LAST_REPORT_STORAGE_KEY),
  );
  const fallbackReportKey =
    (lastReportKey && availableReportKeys.has(lastReportKey) ? lastReportKey : availableReports[0]?.key) ??
    DEFAULT_REPORT_KEY;
  const selectedReportKey = availableReportKeys.has(reportParam as AdminReportKey)
    ? (reportParam as AdminReportKey)
    : fallbackReportKey;
  const selectedReport =
    availableReports.find((report) => report.key === selectedReportKey) ?? getReportDefinition(fallbackReportKey);
  const canViewReports = canAccessReports(profile);

  usePageTitle([t('workspace.title'), t(selectedReport.titleKey)]);

  const [dateRangeState, setDateRangeState] = useState<ReportsDateRangeState>(getInitialReportsDateRangeState);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const {
    filters: reportFilters,
    setFilterField,
    paginationModel,
    setPaginationModel,
    columnVisibilityModel,
    setColumnVisibilityModel,
  } = useDataGridPreferences<{
    search: string;
    paymentMethods: string[];
    receiptKinds: string[];
    statuses: string[];
    categoryIds: string[];
    cashDeskIds: string[];
    cashierIds: string[];
    differenceOnly: string[];
  }>(`reports-${selectedReport.key}`, {
    filters: {
      search: '',
      paymentMethods: [],
      receiptKinds: [],
      statuses: [],
      categoryIds: [],
      cashDeskIds: [],
      cashierIds: [],
      differenceOnly: [],
    },
    paginationModel: DEFAULT_PAGINATION_MODEL,
    columnVisibilityModel: DEFAULT_COLUMN_VISIBILITY_MODEL,
  });
  const { search, paymentMethods, receiptKinds, statuses, categoryIds, cashDeskIds, cashierIds, differenceOnly } =
    reportFilters;
  const setSearch = (value: string) => setFilterField('search', value);
  const setPaymentMethods = (value: string[]) => setFilterField('paymentMethods', value);
  const setReceiptKinds = (value: string[]) => setFilterField('receiptKinds', value);
  const setStatuses = (value: string[]) => setFilterField('statuses', value);
  const setCategoryIds = (value: string[]) => setFilterField('categoryIds', value);
  const setCashDeskIds = (value: string[]) => setFilterField('cashDeskIds', value);
  const setCashierIds = (value: string[]) => setFilterField('cashierIds', value);
  const setDifferenceOnly = (value: string[]) => setFilterField('differenceOnly', value);
  const { startDate, endDate, activePreset } = dateRangeState;

  useEffect(() => {
    if (profile && !canViewReports) {
      router.replace(RoutePath.main);
    }
  }, [canViewReports, profile, router]);

  useEffect(() => {
    if (!reportParam || !availableReportKeys.has(reportParam as AdminReportKey)) {
      router.replace(RouterPathHelper.reportDetail(fallbackReportKey));
    }
  }, [availableReportKeys, fallbackReportKey, reportParam, router]);

  useEffect(() => {
    if (!reportParam || !availableReportKeys.has(reportParam as AdminReportKey)) {
      return;
    }

    const nextReportKey = reportParam as AdminReportKey;
    setLastReportKey(nextReportKey);
    StorageService.setItem(REPORTS_LAST_REPORT_STORAGE_KEY, nextReportKey);
  }, [availableReportKeys, reportParam]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    StorageService.setItem(REPORTS_DATE_RANGE_STORAGE_KEY, dateRangeState);
  }, [dateRangeState]);

  useEffect(() => {
    setSortModel(
      selectedReport.defaultSort
        ? [{ field: selectedReport.defaultSort.field, sort: selectedReport.defaultSort.sort }]
        : [],
    );
  }, [selectedReport.defaultSort, selectedReport.key]);

  if (profile && !canViewReports) {
    return null;
  }

  const handleReportSelect = (reportKey: AdminReportKey) => {
    setLastReportKey(reportKey);
    StorageService.setItem(REPORTS_LAST_REPORT_STORAGE_KEY, reportKey);
    router.push(RouterPathHelper.reportDetail(reportKey));
  };

  const resetPage = () => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const applyDateRangeState = (nextState: ReportsDateRangeState) => {
    setDateRangeState(nextState);
    resetPage();
  };

  const handlePresetChange = (preset: ReportsFixedDatePreset) => {
    applyDateRangeState(createPresetRangeState(preset));
  };

  const handleRangeChange = (nextStartDate: string, nextEndDate: string) => {
    applyDateRangeState(createCustomRangeState(nextStartDate, nextEndDate));
  };

  const handleSearchChange = (value: string) => {
    setSearch(value.trim());
    resetPage();
  };

  const handleClearSearch = () => {
    setSearch('');
    resetPage();
  };

  return (
    <ListPageContent>
      <ListPageBody>
        {!mdUp ? (
          <ReportsMobileTabs
            reports={availableReports}
            selectedKey={selectedReport.key}
            onSelect={handleReportSelect}
          />
        ) : null}

        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 3 }}>
          {mdUp ? (
            <Card sx={{ width: 320, flexShrink: 0, borderRadius: 3, overflow: 'auto' }}>
              <ReportsSidebar
                reports={availableReports}
                selectedKey={selectedReport.key}
                onSelect={handleReportSelect}
              />
            </Card>
          ) : null}

          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
            {selectedReport.kind === 'summary' ? (
              <ReportsSummarySection
                report={selectedReport}
                startDate={startDate}
                endDate={endDate}
                activePreset={activePreset}
                onPresetChange={handlePresetChange}
                onRangeChange={handleRangeChange}
              />
            ) : (
              <ReportsTableSection
                report={selectedReport}
                startDate={startDate}
                endDate={endDate}
                activePreset={activePreset}
                search={search}
                paymentMethods={paymentMethods}
                receiptKinds={receiptKinds}
                statuses={statuses}
                categoryIds={categoryIds}
                cashDeskIds={cashDeskIds}
                cashierIds={cashierIds}
                differenceOnly={differenceOnly}
                paginationModel={paginationModel}
                sortModel={sortModel}
                columnVisibilityModel={columnVisibilityModel}
                onPresetChange={handlePresetChange}
                onRangeChange={handleRangeChange}
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
                onPaymentMethodsChange={setPaymentMethods}
                onReceiptKindsChange={setReceiptKinds}
                onStatusesChange={setStatuses}
                onCategoryIdsChange={setCategoryIds}
                onCashDeskIdsChange={setCashDeskIds}
                onCashierIdsChange={setCashierIds}
                onDifferenceOnlyChange={setDifferenceOnly}
                onPaginationModelChange={setPaginationModel}
                onSortModelChange={setSortModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
              />
            )}
          </Box>
        </Box>
      </ListPageBody>
    </ListPageContent>
  );
};

export default ReportsPage;
