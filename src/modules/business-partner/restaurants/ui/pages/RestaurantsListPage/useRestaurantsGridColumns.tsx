import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { GridColDef } from '@mui/x-data-grid';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import { useResetRestaurantPasswordMutation } from 'modules/product-owner/business-partners/application';
import type { AdminRestaurantListItem } from 'shared/api/admin-types';
import { CustomGridActionsCellItem } from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';
import { formatDateTime } from 'shared/utils/format-time';

import { RestaurantDetailLinkCell, type RestaurantCredentialsDialogState } from '../../components';
import { getRestaurantLifecycleStatus } from '../../shared/restaurant-helpers';

interface RestaurantsGridColumnActions {
  onCreateBranch: (restaurant: AdminRestaurantListItem) => void;
  onActivate: (restaurant: AdminRestaurantListItem) => void;
  onCredentials: (state: RestaurantCredentialsDialogState) => void;
  onDeactivate: (restaurant: AdminRestaurantListItem) => void;
  onChangeTariff: (restaurant: AdminRestaurantListItem) => void;
}

export type RestaurantsGridCapabilities = {
  canCreate: boolean;
  canUpdate: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  canResetPassword: boolean;
  canChangeTariff: boolean;
};

function RestaurantIdentityCell({ restaurant }: { restaurant: AdminRestaurantListItem }) {
  const { t } = useTranslate('organizations');

  return (
    <Stack spacing={0.45} sx={{ minWidth: 0, width: 1, py: 0.75 }}>
      <RestaurantDetailLinkCell id={restaurant.id} name={restaurant.name} />
      {restaurant.branchType === 'branch' ? (
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
          <Chip
            size="small"
            variant="soft"
            label={t('portfolio.branchTypes.branch')}
            sx={{ height: 22, fontSize: 11 }}
          />
          {restaurant.parentName ? (
            <Typography variant="caption" color="text.secondary" noWrap>
              {t('portfolio.parentLabel', { name: restaurant.parentName })}
            </Typography>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}

function RestaurantContactCell({ restaurant }: { restaurant: AdminRestaurantListItem }) {
  const { t } = useTranslate('organizations');

  return (
    <Stack spacing={0.35} sx={{ minWidth: 0, width: 1 }}>
      <Typography variant="body2" noWrap>
        {restaurant.phone || t('labels.notSelected')}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap title={restaurant.address}>
        {restaurant.address || t('labels.notSelected')}
      </Typography>
    </Stack>
  );
}

function RestaurantDeviceCell({ restaurant }: { restaurant: AdminRestaurantListItem }) {
  const { t } = useTranslate('organizations');
  const hasDevices = restaurant.activeDeviceCount > 0;
  const allOnline = hasDevices && restaurant.onlineDeviceCount === restaurant.activeDeviceCount;

  return (
    <Stack spacing={0.35}>
      <Stack direction="row" spacing={0.65} alignItems="center">
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: !hasDevices ? 'text.disabled' : allOnline ? 'success.main' : 'warning.main',
          }}
        />
        <Typography variant="body2" fontWeight={600}>
          {hasDevices ? `${restaurant.onlineDeviceCount}/${restaurant.activeDeviceCount}` : '0'}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {hasDevices ? t('portfolio.devicesOnline') : t('portfolio.noDevices')}
      </Typography>
    </Stack>
  );
}

export function useRestaurantsGridColumns(
  actions: RestaurantsGridColumnActions,
  capabilities: RestaurantsGridCapabilities,
) {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const resetPasswordMutation = useResetRestaurantPasswordMutation();

  const columns = useMemo<GridColDef<AdminRestaurantListItem>[]>(
    () => [
      {
        field: 'name',
        headerName: t('fields.name'),
        minWidth: 205,
        flex: 1.2,
        renderCell: ({ row }) => <RestaurantIdentityCell restaurant={row} />,
      },
      {
        field: 'contact',
        headerName: t('portfolio.columns.contact'),
        minWidth: 180,
        flex: 0.9,
        sortable: false,
        renderCell: ({ row }) => <RestaurantContactCell restaurant={row} />,
      },
      {
        field: 'activeUsersCount',
        headerName: t('portfolio.columns.staff'),
        minWidth: 92,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Iconify icon="solar:users-group-rounded-bold-duotone" width={18} sx={{ color: 'text.secondary' }} />
            <Typography variant="body2">{row.activeUsersCount}</Typography>
          </Stack>
        ),
      },
      {
        field: 'onlineDeviceCount',
        headerName: t('portfolio.columns.devices'),
        minWidth: 108,
        flex: 0.6,
        sortable: false,
        renderCell: ({ row }) => <RestaurantDeviceCell restaurant={row} />,
      },
      {
        field: 'lastSeenAt',
        headerName: t('portfolio.columns.lastSeen'),
        minWidth: 132,
        flex: 0.75,
        renderCell: ({ row }) => (
          <Typography variant="body2" color={row.lastSeenAt ? 'text.primary' : 'text.secondary'}>
            {row.lastSeenAt ? formatDateTime(row.lastSeenAt) : t('portfolio.noActivity')}
          </Typography>
        ),
      },
      {
        field: 'tariff',
        headerName: t('fields.tariff'),
        minWidth: 115,
        flex: 0.75,
        sortable: false,
        valueGetter: (_value, row) =>
          row.tariff?.name ?? (row.activationType === 'custom' ? tPlatform('labels.customActivation') : null),
        renderCell: (params) => (
          <Typography variant="body2" noWrap color={params.value ? 'text.primary' : 'text.secondary'}>
            {params.value || t('labels.notSelected')}
          </Typography>
        ),
      },
      {
        field: 'isActive',
        headerName: t('fields.status'),
        minWidth: 128,
        flex: 0.55,
        renderCell: ({ row }) => {
          const status = getRestaurantLifecycleStatus(row);
          const color = status === 'active' ? 'success' : status === 'attention' ? 'warning' : 'default';

          return <Chip size="small" label={t(`portfolio.lifecycle.${status}`)} color={color} variant="soft" />;
        },
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 68,
        getActions: ({ row }) =>
          [
            capabilities.canUpdate ? (
              <CustomGridActionsCellItem
                actionKind="edit"
                key="edit"
                label={t('actions.edit')}
                icon={<Iconify icon="solar:pen-bold" />}
                href={RouterPathHelper.organizationRestaurantEdit(row.id)}
              />
            ) : null,
            capabilities.canCreate && row.branchType === 'root' ? (
              <CustomGridActionsCellItem
                actionKind="view"
                key="create-branch"
                label={t('actions.createBranch')}
                icon={<Iconify icon="solar:buildings-2-bold" />}
                showInMenu
                onClick={() => actions.onCreateBranch(row)}
              />
            ) : null,
            capabilities.canResetPassword ? (
              <CustomGridActionsCellItem
                actionKind="view"
                key="reset-password"
                label={tPlatform('actions.resetPassword')}
                icon={<Iconify icon="solar:refresh-bold" />}
                showInMenu
                disabled={!row.isActive}
                onClick={async () => {
                  const result = await resetPasswordMutation.mutateAsync(row.id);
                  actions.onCredentials({
                    credentials: { username: result.username, password: result.password },
                    mode: 'reset',
                  });
                }}
              />
            ) : null,
            capabilities.canChangeTariff ? (
              <CustomGridActionsCellItem
                actionKind="view"
                key="change-tariff"
                label={tPlatform('actions.changeTariff')}
                icon={<Iconify icon="solar:transfer-horizontal-bold" />}
                showInMenu
                onClick={() => actions.onChangeTariff(row)}
              />
            ) : null,
            row.isActive && capabilities.canDeactivate ? (
              <CustomGridActionsCellItem
                actionKind="delete"
                key="deactivate"
                label={tPlatform('actions.deactivate')}
                icon={<Iconify icon="solar:lock-keyhole-bold" />}
                onClick={() => actions.onDeactivate(row)}
              />
            ) : null,
            !row.isActive && capabilities.canActivate ? (
              <CustomGridActionsCellItem
                actionKind="view"
                key="activate"
                label={tPlatform('actions.activate')}
                icon={<Iconify icon="solar:play-bold" />}
                onClick={() => actions.onActivate(row)}
              />
            ) : null,
          ].filter(Boolean) as ReactElement[],
      },
    ],
    [actions, capabilities, resetPasswordMutation, t, tCommon, tPlatform],
  );

  return {
    columns,
    isMutating: resetPasswordMutation.isPending,
  };
}
