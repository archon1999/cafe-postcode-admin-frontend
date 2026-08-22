import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridColumnVisibilityModel, GridPaginationModel } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { useAdminScopeStore } from 'modules/auth';
import { DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import {
  DataGrid,
  DataGridEmptyState,
  DataGridFiltersToolbar,
  type DataGridToolbarFilter,
} from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';
import { formatDateTime } from 'shared/utils/format-time';

import {
  useIssueTelegramLinkMutation,
  useRevokeTelegramSubscriptionMutation,
  useTelegramSubscriptionsQuery,
} from '../../../../application';
import type { TelegramLink, TelegramSubscription } from '../../../../domain';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const EMPTY_TELEGRAM_FILTERS: DataGridToolbarFilter[] = [];

function subscriptionName(subscription: TelegramSubscription) {
  if (subscription.username) return `@${subscription.username}`;
  return subscription.firstName || subscription.telegramUserId;
}

export function TelegramPanel() {
  const { t, currentLang } = useTranslate('security-center');
  const restaurantId = useAdminScopeStore((state) => state.selectedRestaurantId);
  const [link, setLink] = useState<TelegramLink | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<TelegramSubscription | null>(null);
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const subscriptionsQuery = useTelegramSubscriptionsQuery(restaurantId);
  const issueMutation = useIssueTelegramLinkMutation();
  const revokeMutation = useRevokeTelegramSubscriptionMutation(restaurantId);

  const issue = async () => {
    if (!restaurantId) return;

    try {
      setLink(await issueMutation.mutateAsync());
    } catch {
      toast.error(t('telegram.messages.issueFailed'));
    }
  };

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link.startUrl);
    toast.success(t('telegram.messages.copied'));
  };

  const revoke = async () => {
    if (!revokeTarget) return;
    try {
      await revokeMutation.mutateAsync(revokeTarget.id);
      toast.success(t('telegram.messages.revoked'));
      setRevokeTarget(null);
    } catch {
      toast.error(t('telegram.messages.revokeFailed'));
    }
  };

  const rows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return (subscriptionsQuery.data ?? []).filter((subscription) => {
      if (!normalizedSearch) return true;

      return [
        subscription.username,
        subscription.firstName,
        subscription.telegramUserId,
        subscription.restaurantName,
      ].some((value) => value?.toLocaleLowerCase().includes(normalizedSearch));
    });
  }, [search, subscriptionsQuery.data]);

  const columns = useMemo<GridColDef<TelegramSubscription>[]>(
    () => [
      {
        field: 'user',
        headerName: t('telegram.user'),
        minWidth: 220,
        flex: 1,
        valueGetter: (_value, row) => subscriptionName(row),
        renderCell: ({ row }) => (
          <Stack justifyContent="center" sx={{ height: 1, minWidth: 0 }}>
            <Typography variant="subtitle2">{subscriptionName(row)}</Typography>
            {row.username && row.firstName && (
              <Typography variant="caption" color="text.secondary">
                {row.firstName}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        field: 'telegramUserId',
        headerName: t('telegram.telegramId'),
        minWidth: 170,
        flex: 0.7,
      },
      {
        field: 'restaurantName',
        headerName: t('devices.restaurant'),
        minWidth: 180,
        flex: 0.8,
      },
      {
        field: 'notificationsEnabled',
        headerName: t('telegram.notifications'),
        width: 170,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            variant="soft"
            color={row.notificationsEnabled ? 'success' : 'default'}
            label={t(row.notificationsEnabled ? 'telegram.enabled' : 'telegram.disabled')}
          />
        ),
      },
      {
        field: 'linkedAt',
        headerName: t('telegram.linkedAt'),
        width: 180,
        valueFormatter: (value) => formatDateTime(value),
      },
      {
        field: 'action',
        headerName: t('common.actions'),
        width: 110,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <Button color="error" size="small" onClick={() => setRevokeTarget(row)}>
            {t('telegram.revoke')}
          </Button>
        ),
      },
    ],
    [t],
  );
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  return (
    <>
      {subscriptionsQuery.isError && restaurantId && (
        <Alert severity="error" sx={{ mx: 2.5, mt: 2 }}>
          {t('telegram.loadError')}
        </Alert>
      )}

      <Box sx={{ width: 1 }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          localeText={localeText}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          loading={subscriptionsQuery.isLoading || subscriptionsQuery.isFetching}
          onRefresh={() => subscriptionsQuery.refetch()}
          refreshing={subscriptionsQuery.isFetching}
          autoRefreshIntervalMs={false}
          disableColumnMenu
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          slots={{
            noRowsOverlay: () => (
              <DataGridEmptyState
                hasActiveFilters={Boolean(search)}
                noData={{ title: t('telegram.empty') }}
                noResults={{ title: t('telegram.empty') }}
              />
            ),
            toolbar: () => (
              <DataGridFiltersToolbar
                searchLabel={t('common.search')}
                searchPlaceholder={t('telegram.searchPlaceholder')}
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
                filters={EMPTY_TELEGRAM_FILTERS}
                columns={columns}
                columnVisibilityModel={columnVisibilityModel}
                defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
                onSaveColumns={setColumnVisibilityModel}
                rightActions={
                  <Tooltip title={!restaurantId ? t('telegram.selectRestaurantTooltip') : ''}>
                    <span>
                      <Button
                        variant="contained"
                        startIcon={<Iconify icon="eva:link-2-fill" />}
                        loading={issueMutation.isPending}
                        disabled={!restaurantId}
                        onClick={() => void issue()}>
                        {t('telegram.createLink')}
                      </Button>
                    </span>
                  </Tooltip>
                }
              />
            ),
          }}
          sx={{
            '--DataGrid-overlayHeight': { xs: '280px', sm: '360px' },
            border: 'none',
            flex: 'none',
            '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-toolbarContainer': { px: 2.5, py: 2 },
          }}
        />
      </Box>

      <Dialog open={Boolean(link)} onClose={() => setLink(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('telegram.linkReady')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('telegram.oneTimeWarning')}
          </Alert>
          <Typography sx={{ overflowWrap: 'anywhere', p: 2, bgcolor: 'background.neutral' }}>
            {link?.startUrl}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('telegram.expiresAt')}: {formatDateTime(link?.expiresAt)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLink(null)}>{t('common.close')}</Button>
          <Button variant="contained" startIcon={<Iconify icon="solar:copy-bold" />} onClick={() => void copy()}>
            {t('telegram.copy')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(revokeTarget)} onClose={() => setRevokeTarget(null)}>
        <DialogTitle>{t('telegram.revokeTitle')}</DialogTitle>
        <DialogContent>{t('telegram.revokeDescription')}</DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeTarget(null)}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" loading={revokeMutation.isPending} onClick={() => void revoke()}>
            {t('telegram.revoke')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
