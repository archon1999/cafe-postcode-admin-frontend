import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip, { type ChipProps } from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridColumnVisibilityModel, GridPaginationModel } from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { useAdminScopeStore } from 'modules/auth';
import { DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import { DataGrid, DataGridEmptyState, DataGridFiltersToolbar } from 'shared/ui/CustomDataGrid';
import { formatDateTime } from 'shared/utils/format-time';

import { useAcknowledgeSecurityEventMutation, useSecurityEventsQuery } from '../../../../application';
import type { SecurityEvent, SecuritySeverity } from '../../../../domain';
import { SecurityStatusChip } from '../../../shared';

import { getSecurityEventLabel, getSecurityEventResultLabel, SECURITY_EVENT_TYPES } from './security-event-types';
import { securityEventsDateRangeToQueryBounds, type SecurityEventsDateRange } from './security-events-date-range';
import { SecurityEventsDateRangeFilter } from './SecurityEventsDateRangeFilter';

export type { SecurityEventsDateRange } from './security-events-date-range';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const SECURITY_SEVERITIES: SecuritySeverity[] = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function resultColor(result: string): ChipProps['color'] {
  const normalizedResult = result.toLocaleLowerCase();

  if (['success', 'approved', 'ok', 'succeeded'].some((value) => normalizedResult.includes(value))) return 'success';
  if (['failed', 'failure', 'rejected', 'denied', 'error'].some((value) => normalizedResult.includes(value)))
    return 'error';

  return 'default';
}

function EventDetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ typography: 'body2', mt: 0.5, overflowWrap: 'anywhere' }}>{value || '—'}</Box>
    </Grid>
  );
}

export type SecurityEventsPanelProps = {
  businessPartnerId?: string | null;
  dateRange?: SecurityEventsDateRange | null;
  onDateRangeChange?: (dateRange: SecurityEventsDateRange | null) => void;
};

export function SecurityEventsPanel({
  businessPartnerId,
  dateRange: controlledDateRange,
  onDateRangeChange,
}: SecurityEventsPanelProps = {}) {
  const { t, currentLang } = useTranslate('security-center');
  const restaurantId = useAdminScopeStore((state) => state.selectedRestaurantId);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('');
  const [severity, setSeverity] = useState<SecuritySeverity | ''>('');
  const [acknowledged, setAcknowledged] = useState<'' | 'true' | 'false'>('false');
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selected, setSelected] = useState<SecurityEvent | null>(null);
  const [uncontrolledDateRange, setUncontrolledDateRange] = useState<SecurityEventsDateRange | null>(null);
  const dateRange = controlledDateRange === undefined ? uncontrolledDateRange : controlledDateRange;
  const dateBounds = useMemo(() => securityEventsDateRangeToQueryBounds(dateRange), [dateRange]);
  const setDateRange = useCallback(
    (nextDateRange: SecurityEventsDateRange | null) => {
      if (controlledDateRange === undefined) setUncontrolledDateRange(nextDateRange);
      onDateRangeChange?.(nextDateRange);
      setPaginationModel((previous) => ({ ...previous, page: 0 }));
    },
    [controlledDateRange, onDateRangeChange],
  );

  useEffect(() => {
    setPaginationModel((previous) => (previous.page === 0 ? previous : { ...previous, page: 0 }));
  }, [businessPartnerId, dateRange?.endDate, dateRange?.startDate, restaurantId]);

  const query = useSecurityEventsQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    businessPartnerId: businessPartnerId || undefined,
    restaurantId: restaurantId || undefined,
    search: search.trim() || undefined,
    eventType: eventType || undefined,
    severity: severity || undefined,
    acknowledged: acknowledged === '' ? undefined : acknowledged === 'true',
    ...dateBounds,
  });
  const acknowledgeMutation = useAcknowledgeSecurityEventMutation();

  const acknowledge = async (eventId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(eventId);
      toast.success(t('events.messages.acknowledged'));
      setSelected(null);
    } catch {
      toast.error(t('events.messages.acknowledgeFailed'));
    }
  };

  const columns = useMemo<GridColDef<SecurityEvent>[]>(
    () => [
      {
        field: 'eventType',
        headerName: t('events.event'),
        minWidth: 260,
        flex: 1,
        sortable: false,
        renderCell: ({ row }) => <Typography variant="subtitle2">{getSecurityEventLabel(t, row.eventType)}</Typography>,
      },
      {
        field: 'severity',
        headerName: t('events.severity'),
        width: 140,
        sortable: false,
        renderCell: ({ row }) => <SecurityStatusChip status={row.severity} label={t(`severities.${row.severity}`)} />,
      },
      {
        field: 'restaurantName',
        headerName: t('devices.restaurant'),
        minWidth: 170,
        flex: 0.7,
        sortable: false,
        valueGetter: (_value, row) => row.restaurantName || t('devices.platform'),
      },
      {
        field: 'actorName',
        headerName: t('events.actor'),
        minWidth: 160,
        flex: 0.65,
        sortable: false,
        valueGetter: (_value, row) => row.actorName || '—',
      },
      {
        field: 'result',
        headerName: t('events.result'),
        width: 120,
        sortable: false,
        valueGetter: (_value, row) => row.result || '—',
        renderCell: ({ row }) => (
          <Chip
            size="small"
            variant="soft"
            color={resultColor(row.result)}
            label={row.result ? getSecurityEventResultLabel(t, row.result) : '—'}
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: t('events.createdAt'),
        width: 170,
        sortable: false,
        valueFormatter: (value) => formatDateTime(value),
      },
    ],
    [t],
  );
  const eventTypeOptions = useMemo(
    () =>
      SECURITY_EVENT_TYPES.map((value) => ({ value, label: getSecurityEventLabel(t, value) })).sort((left, right) =>
        left.label.localeCompare(right.label, currentLang.numberFormat.code),
      ),
    [currentLang.numberFormat.code, t],
  );
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const filters = useMemo(
    () => [
      {
        id: 'eventType',
        label: t('events.eventFilter'),
        value: eventType ? [eventType] : [],
        options: eventTypeOptions,
        onApply: (values: string[]) => {
          setEventType(values[values.length - 1] ?? '');
          setPaginationModel((previous) => ({ ...previous, page: 0 }));
        },
        testId: 'security-events-event-type-filter',
        emptyLabel: t('common.all'),
      },
      {
        id: 'severity',
        label: t('events.severity'),
        value: severity ? [severity] : [],
        options: SECURITY_SEVERITIES.map((value) => ({ value, label: t(`severities.${value}`) })),
        onApply: (values: string[]) => {
          setSeverity((values[values.length - 1] as SecuritySeverity | undefined) ?? '');
          setPaginationModel((previous) => ({ ...previous, page: 0 }));
        },
        testId: 'security-events-severity-filter',
        emptyLabel: t('common.all'),
      },
      {
        id: 'acknowledged',
        label: t('events.reviewState'),
        value: acknowledged ? [acknowledged] : [],
        options: [
          { value: 'false', label: t('events.unreviewed') },
          { value: 'true', label: t('events.reviewed') },
        ],
        onApply: (values: string[]) => {
          setAcknowledged((values[values.length - 1] as 'true' | 'false' | undefined) ?? '');
          setPaginationModel((previous) => ({ ...previous, page: 0 }));
        },
        testId: 'security-events-review-filter',
        emptyLabel: t('common.all'),
      },
    ],
    [acknowledged, eventType, eventTypeOptions, severity, t],
  );

  return (
    <Stack spacing={2}>
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void query.refetch()}>
              {t('events.retry')}
            </Button>
          }>
          {t('events.loadError')}
        </Alert>
      )}

      <Box sx={{ width: 1 }}>
        <DataGrid
          autoHeight
          rows={query.data?.items ?? []}
          columns={columns}
          rowCount={query.data?.total ?? 0}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          loading={query.isLoading || query.isFetching}
          localeText={localeText}
          onRefresh={() => query.refetch()}
          refreshing={query.isFetching}
          autoRefreshIntervalMs={false}
          disableColumnMenu
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          onRowClick={({ row }) => setSelected(row)}
          slots={{
            noRowsOverlay: () => (
              <DataGridEmptyState
                hasActiveFilters={Boolean(
                  search || restaurantId || eventType || severity || acknowledged !== '' || dateRange,
                )}
                noData={{ title: t('events.empty') }}
                noResults={{ title: t('events.empty') }}
              />
            ),
            toolbar: () => (
              <DataGridFiltersToolbar
                searchLabel={t('common.search')}
                searchPlaceholder={t('events.searchPlaceholder')}
                clearSearchLabel={t('common.clearSearch')}
                search={search}
                onSearchChange={(value) => {
                  setSearch(value.trim());
                  setPaginationModel((previous) => ({ ...previous, page: 0 }));
                }}
                onClearSearch={() => {
                  setSearch('');
                  setPaginationModel((previous) => ({ ...previous, page: 0 }));
                }}
                filters={filters}
                columns={columns}
                columnVisibilityModel={columnVisibilityModel}
                defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
                onSaveColumns={setColumnVisibilityModel}
                rightActions={<SecurityEventsDateRangeFilter value={dateRange} onChange={setDateRange} />}
              />
            ),
          }}
          sx={{
            border: 'none',
            flex: 'none',
            '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-toolbarContainer': { px: 2.5, py: 2 },
          }}
        />
      </Box>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {t('events.detailsTitle')}
            </Typography>
            {selected && <SecurityStatusChip status={selected.severity} label={t(`severities.${selected.severity}`)} />}
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={3}>
              <Grid container spacing={2.5}>
                <EventDetailField label={t('events.event')} value={getSecurityEventLabel(t, selected.eventType)} />
                <EventDetailField label={t('events.createdAt')} value={formatDateTime(selected.createdAt)} />
                <EventDetailField
                  label={t('devices.restaurant')}
                  value={selected.restaurantName || t('devices.platform')}
                />
                <EventDetailField
                  label={t('events.result')}
                  value={selected.result ? getSecurityEventResultLabel(t, selected.result) : '—'}
                />
                <EventDetailField label={t('events.actor')} value={selected.actorName} />
                <EventDetailField label={t('events.ip')} value={selected.clientIp} />
                <EventDetailField label={t('events.requestId')} value={selected.requestId} />
              </Grid>

              {Object.keys(selected.metadata).length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t('events.metadata')}
                  </Typography>
                  <Typography
                    component="pre"
                    variant="caption"
                    sx={{ m: 0, p: 2, bgcolor: 'background.neutral', overflowX: 'auto' }}>
                    {JSON.stringify(selected.metadata, null, 2)}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>{t('common.close')}</Button>
          {selected && !selected.acknowledgedAt && (
            <Button
              variant="contained"
              loading={acknowledgeMutation.isPending}
              onClick={() => void acknowledge(selected.id)}>
              {t('events.acknowledge')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
