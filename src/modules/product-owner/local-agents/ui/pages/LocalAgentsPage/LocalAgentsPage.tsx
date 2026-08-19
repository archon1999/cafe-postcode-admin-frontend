import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import type {
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessLocalAgents } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import type { AdminLocalAgent, AdminLocalAgentBulkAction, AdminLocalAgentStatus } from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { useRouter } from 'shared/hooks/router';
import { BulkActionsBar } from 'shared/ui/BulkActionsBar';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { DataGrid, DataGridEmptyState, DataGridFiltersToolbar } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useLocalAgentBulkActionMutation, useLocalAgentFleetQuery } from '../../../application';

import { LocalAgentFleetDiagnosticsDialog } from './LocalAgentFleetDiagnosticsDialog';
import { useLocalAgentColumns } from './useLocalAgentColumns';

type StatusFilter = 'all' | AdminLocalAgentStatus;

const DEFAULT_LOCAL_AGENTS_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 20 };
const DEFAULT_LOCAL_AGENTS_SORT_MODEL: GridSortModel = [{ field: 'lastSeenAt', sort: 'desc' }];

function LocalAgentsPage() {
  const { t, currentLang } = useTranslate('platform');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_LOCAL_AGENTS_PAGINATION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_LOCAL_AGENTS_SORT_MODEL);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [selectedAgent, setSelectedAgent] = useState<AdminLocalAgent | null>(null);
  const [bulkActionToConfirm, setBulkActionToConfirm] = useState<AdminLocalAgentBulkAction | null>(null);
  const canAccess = canAccessLocalAgents(profile);
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const selectAgent = useCallback((agent: AdminLocalAgent) => setSelectedAgent(agent), []);
  const columns = useLocalAgentColumns(selectAgent);

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
                    setPaginationModel((previous) => ({ ...previous, page: 0 }));
                  }}
                  onClearSearch={() => {
                    setSearch('');
                    setPaginationModel((previous) => ({ ...previous, page: 0 }));
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
                        setPaginationModel((previous) => ({ ...previous, page: 0 }));
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
      <LocalAgentFleetDiagnosticsDialog agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
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
