import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessLocalAgents } from 'app/routes';
import { useAdminScopeStore, useCurrentUser } from 'modules/auth';
import type { AdminLocalAgent, AdminLocalAgentBulkAction, AdminLocalAgentStatus } from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { useRouter } from 'shared/hooks/router';
import { BulkActionsBar } from 'shared/ui/BulkActionsBar';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { DataGrid, DataGridEmptyState, DataGridFiltersToolbar } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import { DetailPageLink } from 'shared/ui/DetailPageLink/DetailPageLink';
import { Iconify } from 'shared/ui/Iconify';
import { LocalAgentDiagnosticsDialog, type LocalAgentDiagnosticsData } from 'shared/ui/LocalAgentDiagnosticsDialog';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useLocalAgentFleetDiagnosticsQuery,
  useLocalAgentBulkActionMutation,
  useLocalAgentFleetLogsQuery,
  useLocalAgentFleetQuery,
  useUpdateLocalAgentNowMutation,
} from '../../../application';

type StatusFilter = 'all' | AdminLocalAgentStatus;

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'medium' }).format(date);
}

function DiagnosticsDialog({ agent, onClose }: { agent: AdminLocalAgent | null; onClose: () => void }) {
  const { t } = useTranslate('platform');
  const query = useLocalAgentFleetDiagnosticsQuery(agent?.id ?? null);
  const logsSupported = Boolean(agent?.capabilities.includes('remote_logs'));
  const logsQuery = useLocalAgentFleetLogsQuery(agent?.id ?? null, logsSupported);
  const updateMutation = useUpdateLocalAgentNowMutation();
  const diagnostics = query.data?.status as LocalAgentDiagnosticsData | undefined;

  const requestUpdate = async () => {
    if (!agent) return;
    try {
      await updateMutation.mutateAsync(agent.id);
      toast.success(t('localAgents.messages.updateRequested'));
    } catch {
      toast.error(t('localAgents.messages.updateFailed'));
    }
  };

  return (
    <LocalAgentDiagnosticsDialog
      open={Boolean(agent)}
      onClose={onClose}
      diagnostics={diagnostics}
      diagnosticsLoading={query.isLoading}
      diagnosticsError={query.isError}
      update={query.data?.update}
      canUpdate={Boolean(agent?.online && agent.capabilities.includes('auto_update'))}
      updatePending={updateMutation.isPending}
      onUpdate={() => void requestUpdate()}
      logsSupported={logsSupported}
      logs={logsQuery.data}
      logsLoading={logsQuery.isLoading}
      logsError={logsQuery.isError}
      refreshing={query.isFetching || logsQuery.isFetching}
      onRefresh={() => {
        void query.refetch();
        if (logsSupported) void logsQuery.refetch();
      }}
    />
  );
}

function LocalAgentsPage() {
  const { t, currentLang } = useTranslate('platform');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const queryClient = useQueryClient();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [selectedAgent, setSelectedAgent] = useState<AdminLocalAgent | null>(null);
  const [bulkActionToConfirm, setBulkActionToConfirm] = useState<AdminLocalAgentBulkAction | null>(null);
  const canAccess = canAccessLocalAgents(profile);
  const setSelectedRestaurantId = useAdminScopeStore((state) => state.setSelectedRestaurantId);
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  useEffect(() => {
    if (profile && !canAccess) replace(RoutePath.main);
  }, [canAccess, profile, replace]);

  const query = useLocalAgentFleetQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search.trim() || undefined,
    status: status === 'all' ? undefined : status,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const bulkMutation = useLocalAgentBulkActionMutation();
  const selectedAgentIds = selectedRows.type === 'include' ? Array.from(selectedRows.ids).map(String) : [];
  const selectedCount = selectedAgentIds.length;

  const runBulkAction = async () => {
    if (!bulkActionToConfirm || !selectedAgentIds.length) return;
    try {
      const result = await bulkMutation.mutateAsync({ action: bulkActionToConfirm, agentIds: selectedAgentIds });
      if (result.failed) {
        toast.error(t('localAgents.messages.bulkPartial', { succeeded: result.succeeded, failed: result.failed }));
      } else {
        toast.success(t('localAgents.messages.bulkSucceeded', { count: result.succeeded }));
      }
      setSelectedRows(DEFAULT_SELECTION_MODEL());
      setBulkActionToConfirm(null);
    } catch {
      toast.error(t('localAgents.messages.bulkFailed'));
    }
  };

  const columns = useMemo<GridColDef<AdminLocalAgent>[]>(
    () => [
      {
        field: 'restaurantName',
        headerName: t('localAgents.fields.restaurant'),
        minWidth: 260,
        flex: 1,
        renderCell: ({ row }) => (
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
              <DetailPageLink
                href={RoutePath.organizationMyRestaurantSetup}
                onClick={() => {
                  setSelectedRestaurantId(row.restaurantId);
                  void queryClient.invalidateQueries();
                }}>
                {row.restaurantName}
              </DetailPageLink>
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.name}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'status',
        headerName: t('localAgents.fields.status'),
        minWidth: 140,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            variant="soft"
            color={row.online ? 'success' : 'error'}
            label={t(`localAgents.status.${row.online ? 'online' : 'offline'}`)}
          />
        ),
      },
      {
        field: 'version',
        headerName: t('localAgents.fields.version'),
        minWidth: 130,
        flex: 0.4,
        valueFormatter: (value) => value || '—',
      },
      {
        field: 'lastSeenAt',
        headerName: t('localAgents.fields.lastSeen'),
        minWidth: 210,
        flex: 0.65,
        valueFormatter: (value) => formatDate(value),
      },
      {
        field: 'actions',
        headerName: t('localAgents.fields.actions'),
        minWidth: 90,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Tooltip title={t('localAgents.actions.diagnostics')}>
            <IconButton color="primary" onClick={() => setSelectedAgent(row)}>
              <Iconify icon="solar:info-circle-bold-duotone" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [queryClient, setSelectedRestaurantId, t],
  );

  if (profile && !canAccess) return null;

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('localAgents.title')} />
      <ListPageBody>
        <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            checkboxSelection
            rows={query.data?.data ?? []}
            columns={columns}
            rowCount={query.data?.total ?? 0}
            loading={query.isLoading}
            onRefresh={() => void query.refetch()}
            refreshing={query.isFetching}
            localeText={localeText}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={setSelectedRows}
            disableRowSelectionExcludeModel
            keepNonExistentRowsSelected
            disableRowSelectionOnClick
            disableColumnMenu
            slots={{
              toolbar: () => (
                <DataGridFiltersToolbar
                  searchLabel={t('localAgents.filters.search')}
                  searchPlaceholder={t('localAgents.filters.searchPlaceholder')}
                  clearSearchLabel={t('localAgents.filters.clearSearch')}
                  search={search}
                  onSearchChange={(nextSearch) => {
                    setSearch(nextSearch.trim());
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
                  onClearSearch={() => {
                    setSearch('');
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
                  filters={[
                    {
                      id: 'status',
                      label: t('localAgents.filters.status'),
                      value: status === 'all' ? [] : [status],
                      options: [
                        { value: 'online', label: t('localAgents.status.online') },
                        { value: 'offline', label: t('localAgents.status.offline') },
                      ],
                      onApply: (values) => {
                        setStatus(values.length === 1 ? (values[0] as AdminLocalAgentStatus) : 'all');
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'local-agents-status-filter',
                      emptyLabel: t('localAgents.filters.all'),
                    },
                  ]}
                  columns={columns}
                  columnVisibilityModel={columnVisibilityModel}
                  defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
                  onSaveColumns={setColumnVisibilityModel}
                />
              ),
              noRowsOverlay: () => (
                <DataGridEmptyState
                  hasActiveFilters={Boolean(search || status !== 'all')}
                  noData={{
                    title: t('localAgents.empty.noDataTitle'),
                    description: t('localAgents.empty.noDataDescription'),
                  }}
                  noResults={{
                    title: t('localAgents.empty.noResultsTitle'),
                    description: t('localAgents.empty.noResultsDescription'),
                  }}
                />
              ),
            }}
            sx={{
              border: 'none',
              [`& .${gridClasses.cell}`]: { display: 'flex', alignItems: 'center' },
              '& .MuiDataGrid-toolbarContainer': { px: 2.5, py: 2 },
            }}
          />
        </Card>
      </ListPageBody>
      {selectedCount > 0 && (
        <BulkActionsBar
          selectedCount={selectedCount}
          selectedLabel={t('localAgents.bulk.selectedLabel')}
          summaryValue={t('localAgents.bulk.selectedCount', { count: selectedCount })}
          actions={[
            {
              key: 'update',
              label: t('localAgents.actions.bulkUpdate'),
              startIcon: <Iconify icon="solar:download-minimalistic-bold" />,
              disabled: bulkMutation.isPending,
              onClick: () => setBulkActionToConfirm('update'),
            },
            {
              key: 'refresh-context',
              label: t('localAgents.actions.refreshContext'),
              startIcon: <Iconify icon="solar:refresh-square-bold" />,
              disabled: bulkMutation.isPending,
              onClick: () => setBulkActionToConfirm('refresh_context'),
            },
            {
              key: 'restart',
              label: t('localAgents.actions.restart'),
              color: 'warning',
              startIcon: <Iconify icon="solar:restart-bold" />,
              disabled: bulkMutation.isPending,
              onClick: () => setBulkActionToConfirm('restart'),
            },
          ]}
          onClose={() => setSelectedRows(DEFAULT_SELECTION_MODEL())}
        />
      )}
      <DiagnosticsDialog agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      <ConfirmDialog
        open={Boolean(bulkActionToConfirm)}
        onClose={() => setBulkActionToConfirm(null)}
        title={bulkActionToConfirm ? t(`localAgents.bulk.${bulkActionToConfirm}.title`) : t('localAgents.title')}
        content={
          bulkActionToConfirm ? t(`localAgents.bulk.${bulkActionToConfirm}.description`, { count: selectedCount }) : ''
        }
        action={
          <Button
            variant="contained"
            color={bulkActionToConfirm === 'restart' ? 'warning' : 'primary'}
            loading={bulkMutation.isPending}
            onClick={() => void runBulkAction()}>
            {t('localAgents.actions.confirm')}
          </Button>
        }
      />
    </ListPageContent>
  );
}

export default LocalAgentsPage;
