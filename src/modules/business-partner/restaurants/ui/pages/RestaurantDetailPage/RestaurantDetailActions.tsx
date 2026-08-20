import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useResetRestaurantPasswordMutation } from 'modules/product-owner/business-partners/application';
import type { AdminGeneratedCredentials, AdminRestaurantDetail } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { canUseRestaurantPermission } from '../../shared/restaurant-helpers';

type RestaurantDetailActionsProps = {
  restaurant: AdminRestaurantDetail;
  onCreateBranch: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onChangeTariff: () => void;
  onCredentials: (credentials: AdminGeneratedCredentials) => void;
};

export function RestaurantDetailActions({
  restaurant,
  onCreateBranch,
  onActivate,
  onDeactivate,
  onChangeTariff,
  onCredentials,
}: RestaurantDetailActionsProps) {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const { profile } = useCurrentUser();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const resetPasswordMutation = useResetRestaurantPasswordMutation();

  const canCreate = canUseRestaurantPermission(profile, 'create') && !restaurant.parentId;
  const canUpdate = canUseRestaurantPermission(profile, 'update');
  const canResetPassword = canUseRestaurantPermission(profile, 'reset_password') && restaurant.isActive;
  const canChangeTariff = canUseRestaurantPermission(profile, 'change_tariff');
  const canToggleStatus = restaurant.isActive
    ? canUseRestaurantPermission(profile, 'deactivate')
    : canUseRestaurantPermission(profile, 'activate');
  const hasMenuActions = canCreate || canResetPassword || canChangeTariff || canToggleStatus;

  const runMenuAction = (action: () => void | Promise<void>) => {
    setAnchorEl(null);
    void action();
  };

  return (
    <Stack direction="row" spacing={1}>
      {canUpdate ? (
        <Button
          component={RouterLink}
          href={RouterPathHelper.organizationRestaurantEdit(restaurant.id)}
          variant="contained"
          color="black"
          startIcon={<Iconify icon="solar:pen-bold" />}>
          {t('actions.edit')}
        </Button>
      ) : null}

      {hasMenuActions ? (
        <>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:menu-dots-bold" />}
            onClick={(event) => setAnchorEl(event.currentTarget)}>
            {t('restaurantDetail.moreActions')}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            {canCreate ? (
              <MenuItem onClick={() => runMenuAction(onCreateBranch)}>
                <ListItemIcon>
                  <Iconify icon="solar:buildings-2-bold" />
                </ListItemIcon>
                {t('actions.createBranch')}
              </MenuItem>
            ) : null}
            {canResetPassword ? (
              <MenuItem
                disabled={resetPasswordMutation.isPending}
                onClick={() =>
                  runMenuAction(async () => {
                    const result = await resetPasswordMutation.mutateAsync(restaurant.id);
                    onCredentials({ username: result.username, password: result.password });
                  })
                }>
                <ListItemIcon>
                  <Iconify icon="solar:refresh-bold" />
                </ListItemIcon>
                {tPlatform('actions.resetPassword')}
              </MenuItem>
            ) : null}
            {canChangeTariff ? (
              <MenuItem onClick={() => runMenuAction(onChangeTariff)}>
                <ListItemIcon>
                  <Iconify icon="solar:transfer-horizontal-bold" />
                </ListItemIcon>
                {tPlatform('actions.changeTariff')}
              </MenuItem>
            ) : null}
            {canToggleStatus ? (
              <MenuItem onClick={() => runMenuAction(restaurant.isActive ? onDeactivate : onActivate)}>
                <ListItemIcon>
                  <Iconify icon={restaurant.isActive ? 'solar:lock-keyhole-bold' : 'solar:play-bold'} />
                </ListItemIcon>
                {restaurant.isActive ? tPlatform('actions.deactivate') : tPlatform('actions.activate')}
              </MenuItem>
            ) : null}
          </Menu>
        </>
      ) : null}
    </Stack>
  );
}
