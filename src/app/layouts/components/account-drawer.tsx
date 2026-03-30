import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import type { IconButtonProps } from '@mui/material/IconButton';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'minimal-shared/hooks';

import { useTranslate } from 'app/providers/locales';
import { useCurrentUser } from 'modules/auth';
import { AnimateBorder } from 'shared/ui/Animate';
import { Iconify } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import { LabelRowWithIcon } from 'shared/ui/LabelRowWithIcon/LabelRowWithIcon';
import { Scrollbar } from 'shared/ui/Scrollbar';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

export type AccountDrawerProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountDrawer({ sx, ...other }: AccountDrawerProps) {
  const { t } = useTranslate('common');
  const { t: tUsers } = useTranslate('users');
  const { user, profile } = useCurrentUser();
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const displayName = user?.displayName ?? t('labels.user');
  const photoURL = user?.photoURL ?? '';
  const avatarFallback = displayName.charAt(0).toUpperCase() || '?';
  const roleLabel = profile?.role?.name ?? user?.roleLabel ?? '-';
  const permissions = profile?.permissionCodes ?? [];

  return (
    <>
      <AccountButton onClick={onOpen} photoURL={photoURL} displayName={displayName} sx={sx} {...other} />

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
          paper: { sx: { width: 320 } },
        }}>
        <IconButton
          onClick={onClose}
          sx={{
            top: 12,
            left: 12,
            zIndex: 9,
            position: 'absolute',
          }}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar>
          <Box
            sx={{
              pt: 8,
              px: 3,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}>
            <AnimateBorder
              sx={{ mb: 2, p: '6px', width: 96, height: 96, borderRadius: '50%' }}
              slotProps={{ primaryBorder: { size: 120, sx: { color: 'primary.main' } } }}>
              <Avatar src={photoURL} alt={displayName} sx={{ width: 1, height: 1 }}>
                {avatarFallback}
              </Avatar>
            </AnimateBorder>

            <Typography variant="subtitle1" noWrap sx={{ mt: 2 }}>
              {displayName}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" justifyContent="center">
              {roleLabel && roleLabel !== '-' && (
                <Label color="info" variant="soft">
                  {roleLabel}
                </Label>
              )}
              {typeof user?.isActive === 'boolean' && (
                <Label color={user.isActive ? 'success' : 'error'} variant="soft">
                  {user.isActive ? t('status.active') : t('status.inactive')}
                </Label>
              )}
            </Stack>
          </Box>

          <Box sx={{ px: 3, py: 3 }}>
            <Stack spacing={2.25}>
              {user?.username && (
                <LabelRowWithIcon label={t('labels.username')} value={user.username} icon="solar:user-bold-duotone" />
              )}
              <LabelRowWithIcon label={tUsers('fields.role')} value={roleLabel} icon="solar:shield-user-bold-duotone" />
              {user?.phone && (
                <LabelRowWithIcon label={t('labels.phone')} value={user.phone} icon="solar:phone-bold-duotone" />
              )}
              <LabelRowWithIcon
                label={tUsers('fields.permissions')}
                value={permissions.length ? permissions.join(', ') : '-'}
                icon="solar:key-bold-duotone"
              />
              <LabelRowWithIcon
                label={tUsers('fields.restaurantId')}
                value={profile?.restaurantId ?? '-'}
                icon="solar:shop-bold-duotone"
              />
            </Stack>
          </Box>
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <SignOutButton onClose={onClose} />
        </Box>
      </Drawer>
    </>
  );
}
