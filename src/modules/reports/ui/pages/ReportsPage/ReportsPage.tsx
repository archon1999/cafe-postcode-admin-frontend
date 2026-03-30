import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { GridColumnVisibilityModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { RoutePath, RouterPathHelper, canAccessReports } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import type { AdminReportKey, AdminReportPeriodType } from 'shared/api/admin-types';
import { useParams, useRouter } from 'shared/hooks/router';
import { getCurrentTashkentTime } from 'shared/utils/dayjs';

import { DEFAULT_REPORT_KEY, getReportDefinition, REPORTS_REGISTRY } from '../../../domain';
import { ReportsMobileTabs } from '../../components/ReportsMobileTabs';
import { ReportsSidebar } from '../../components/ReportsSidebar';
import { ReportsSummarySection } from '../../components/ReportsSummarySection';
import { ReportsTableSection } from '../../components/ReportsTableSection';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};

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

  const [periodType, setPeriodType] = useState<AdminReportPeriodType>('day');
  const [selectedDate, setSelectedDate] = useState(() => getCurrentTashkentTime().format('YYYY-MM-DD'));
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentTashkentTime().format('YYYY-MM'));
  const [selectedYear, setSelectedYear] = useState(() => getCurrentTashkentTime().format('YYYY'));
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

  const handlePeriodTypeChange = (value: AdminReportPeriodType) => {
    setPeriodType(value);
    resetPage();
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    resetPage();
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    resetPage();
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    resetPage();
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
                periodType={periodType}
                selectedDate={selectedDate}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onPeriodTypeChange={handlePeriodTypeChange}
                onDateChange={handleDateChange}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
              />
            ) : (
              <ReportsTableSection
                report={selectedReport}
                periodType={periodType}
                selectedDate={selectedDate}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
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
                onPeriodTypeChange={handlePeriodTypeChange}
                onDateChange={handleDateChange}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
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
