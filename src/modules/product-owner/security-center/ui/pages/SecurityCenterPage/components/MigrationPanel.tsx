import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridColumnVisibilityModel, GridPaginationModel } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import { DataGrid, DataGridEmptyState, DataGridFiltersToolbar } from 'shared/ui/CustomDataGrid';
import { formatDateTime } from 'shared/utils/format-time';

import { useDeviceMigrationSummaryQuery } from '../../../../application';
import {
  evaluateBranchRolloutReadiness,
  type BranchRolloutReadiness,
  type BranchRolloutStage,
  type DeviceMigrationBranch,
  type RolloutReadinessGate,
} from '../../../../domain';

type MigrationRow = {
  branch: DeviceMigrationBranch;
  readiness: BranchRolloutReadiness;
};

const stageColor: Record<BranchRolloutStage, 'error' | 'info' | 'warning' | 'success'> = {
  fixPrerequisites: 'error',
  readyForPOSUpdate: 'info',
  migrationInProgress: 'warning',
  readyForBridgeOff: 'success',
};

const rolloutStages: BranchRolloutStage[] = [
  'fixPrerequisites',
  'readyForPOSUpdate',
  'migrationInProgress',
  'readyForBridgeOff',
];

function GateDetails({ title, gate }: { title: string; gate: RolloutReadinessGate }) {
  const { t } = useTranslate('security-center');

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle2">{title}</Typography>
        <Chip
          size="small"
          variant="soft"
          color={gate.ready ? 'success' : 'warning'}
          label={t(gate.ready ? 'readiness.statuses.ready' : 'readiness.statuses.notReady')}
        />
      </Stack>
      {gate.reasons.length ? (
        <Stack component="ul" spacing={0.75} sx={{ pl: 2.5, my: 0 }}>
          {gate.reasons.map((reason) => (
            <Typography component="li" variant="body2" color="text.secondary" key={reason.code}>
              {t(`readiness.reasons.${reason.code}`, {
                count: reason.count,
                failure: reason.detail,
              })}
            </Typography>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('migration.noBlockers')}
        </Typography>
      )}
    </Stack>
  );
}

export function MigrationPanel() {
  const { t } = useTranslate('security-center');
  const query = useDeviceMigrationSummaryQuery();
  const [selected, setSelected] = useState<MigrationRow | null>(null);
  const [search, setSearch] = useState('');
  const [stages, setStages] = useState<BranchRolloutStage[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const snapshotAt = query.dataUpdatedAt || Date.now();
  const rows = useMemo<MigrationRow[]>(
    () =>
      (query.data?.branches ?? [])
        .map((branch) => ({ branch, readiness: evaluateBranchRolloutReadiness(branch, snapshotAt) }))
        .sort((a, b) => {
          if (a.readiness.fullyMigrated !== b.readiness.fullyMigrated) return a.readiness.fullyMigrated ? 1 : -1;
          return a.branch.restaurantName.localeCompare(b.branch.restaurantName);
        }),
    [query.data?.branches, snapshotAt],
  );
  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return rows.filter(
      (row) =>
        (!normalizedSearch || row.branch.restaurantName.toLocaleLowerCase().includes(normalizedSearch)) &&
        (!stages.length || stages.includes(row.readiness.stage)),
    );
  }, [rows, search, stages]);
  const columns = useMemo<GridColDef<MigrationRow>[]>(
    () => [
      {
        field: 'branch',
        headerName: t('migration.table.branch'),
        minWidth: 220,
        flex: 1,
        valueGetter: (_value, row) => row.branch.restaurantName,
        renderCell: ({ row }) => <Typography variant="subtitle2">{row.branch.restaurantName}</Typography>,
      },
      {
        field: 'agent',
        headerName: t('migration.table.agent'),
        minWidth: 180,
        flex: 0.8,
        sortable: false,
        renderCell: ({ row }) => {
          const agentState = !row.branch.agent
            ? 'missing'
            : row.branch.agent.online
              ? row.branch.agent.deviceMigrated
                ? 'online'
                : 'migrationRequired'
              : 'offline';

          return (
            <Stack justifyContent="center" sx={{ height: 1, minWidth: 0 }}>
              <Typography variant="body2">{t(`readiness.agentStates.${agentState}`)}</Typography>
              {row.branch.agent?.lastSeenAt && (
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(row.branch.agent.lastSeenAt)}
                </Typography>
              )}
            </Stack>
          );
        },
      },
      {
        field: 'activePOSDevices',
        headerName: t('migration.table.pos'),
        width: 110,
        align: 'center',
        headerAlign: 'center',
        valueGetter: (_value, row) => row.branch.activePOSDevices,
      },
      {
        field: 'unboundPOSSessions',
        headerName: t('migration.table.unbound'),
        width: 120,
        align: 'center',
        headerAlign: 'center',
        valueGetter: (_value, row) => row.branch.unboundPOSSessions,
      },
      {
        field: 'stage',
        headerName: t('migration.table.stage'),
        minWidth: 210,
        flex: 0.8,
        valueGetter: (_value, row) => t(`readiness.stages.${row.readiness.stage}`),
        renderCell: ({ row }) => (
          <Chip
            size="small"
            variant="soft"
            color={stageColor[row.readiness.stage]}
            label={t(`readiness.stages.${row.readiness.stage}`)}
          />
        ),
      },
    ],
    [t],
  );
  const filters = useMemo(
    () => [
      {
        id: 'stages',
        label: t('migration.table.stage'),
        value: stages,
        options: rolloutStages.map((stage) => ({
          value: stage,
          label: t(`readiness.stages.${stage}`),
        })),
        onApply: (values: string[]) => {
          setStages(values as BranchRolloutStage[]);
          setPaginationModel((previous) => ({ ...previous, page: 0 }));
        },
        testId: 'migration-stage-filter',
        emptyLabel: t('common.all'),
      },
    ],
    [stages, t],
  );

  if (query.isError && !query.data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void query.refetch()}>
            {t('readiness.retry')}
          </Button>
        }>
        {t('readiness.loadErrorDescription')}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      {query.isError && <Alert severity="warning">{t('readiness.refreshError')}</Alert>}

      <Box sx={{ width: 1 }}>
        <DataGrid
          autoHeight
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.branch.restaurantId}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10]}
          loading={query.isLoading || query.isFetching}
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
                hasActiveFilters={Boolean(search || stages.length)}
                noData={{ title: t('readiness.empty') }}
                noResults={{ title: t('readiness.filters.noResults') }}
              />
            ),
            toolbar: () => (
              <DataGridFiltersToolbar
                searchLabel={t('common.search')}
                searchPlaceholder={t('readiness.filters.searchPlaceholder')}
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

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('migration.detailsTitle', { branch: selected?.branch.restaurantName })}</DialogTitle>
        <DialogContent>
          {selected && (
            <Stack spacing={2.5} sx={{ pt: 0.5 }}>
              <Alert severity={selected.readiness.fullyMigrated ? 'success' : 'info'}>
                {t(`readiness.nextActions.${selected.readiness.stage}`)}
              </Alert>
              <GateDetails title={t('readiness.gates.posUpdate')} gate={selected.readiness.posUpdate} />
              <Divider />
              <GateDetails title={t('readiness.gates.finalization')} gate={selected.readiness.finalization} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
