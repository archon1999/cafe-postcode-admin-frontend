import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { GridColumnVisibilityModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { RoutePath, RouterPathHelper, canAccessReports } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import type { AdminReportKey } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import { useParams, useRouter } from 'shared/hooks/router';

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

function getInitialReportsDateRangeState(): ReportsDateRangeState {
  const fallbackState = createPresetRangeState('today');

  if (typeof window === 'undefined') {
    return fallbackState;
  }

  try {
    const rawValue = window.sessionStorage.getItem(REPORTS_DATE_RANGE_STORAGE_KEY);

    if (!rawValue) {
      return fallbackState;
    }

    const parsed = JSON.parse(rawValue) as Partial<ReportsDateRangeState>;

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
  const fallbackReportKey = availableReports[0]?.key ?? DEFAULT_REPORT_KEY;
  const selectedReportKey = availableReportKeys.has(reportParam as AdminReportKey)
    ? (reportParam as AdminReportKey)
    : fallbackReportKey;
  const selectedReport =
    availableReports.find((report) => report.key === selectedReportKey) ?? getReportDefinition(fallbackReportKey);
  const canViewReports = canAccessReports(profile);

  const [dateRangeState, setDateRangeState] = useState<ReportsDateRangeState>(getInitialReportsDateRangeState);
  const [search, setSearch] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [hallIds, setHallIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [cashDeskIds, setCashDeskIds] = useState<string[]>([]);
  const [cashierIds, setCashierIds] = useState<string[]>([]);
  const [differenceOnly, setDifferenceOnly] = useState<string[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const { startDate, endDate, activePreset } = dateRangeState;

  useEffect(() => {
    if (profile && !canViewReports) {
      router.replace(RoutePath.main);
    }
  }, [canViewReports, profile, router]);

  useEffect(() => {
    if (reportParam && !availableReportKeys.has(reportParam as AdminReportKey)) {
      router.replace(RouterPathHelper.reportDetail(fallbackReportKey));
    }
  }, [availableReportKeys, fallbackReportKey, reportParam, router]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.setItem(REPORTS_DATE_RANGE_STORAGE_KEY, JSON.stringify(dateRangeState));
  }, [dateRangeState]);

  useEffect(() => {
    setSearch('');
    setPaymentMethods([]);
    setStatuses([]);
    setHallIds([]);
    setCategoryIds([]);
    setCashDeskIds([]);
    setCashierIds([]);
    setDifferenceOnly([]);
    setPaginationModel(DEFAULT_PAGINATION_MODEL);
    setColumnVisibilityModel(DEFAULT_COLUMN_VISIBILITY_MODEL);
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
                statuses={statuses}
                hallIds={hallIds}
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
                onStatusesChange={setStatuses}
                onHallIdsChange={setHallIds}
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
