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
import { buildAccountDrawerContent } from './account-drawer.utils';
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
  const { user, profile } = useCurrentUser();
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const displayName = user?.displayName ?? t('labels.user');
  const photoURL = user?.photoURL ?? '';
  const avatarFallback = displayName.charAt(0).toUpperCase() || '?';

  const drawerContent = buildAccountDrawerContent({
    profile,
    user,
    tCommon: t,
  });

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
              {drawerContent.badgeLabel && (
                <Label color="info" variant="soft">
                  {drawerContent.badgeLabel}
                </Label>
              )}
            </Stack>
          </Box>

          <Box sx={{ px: 3, py: 3 }}>
            <Typography variant="overline" sx={{ mb: 1.5, display: 'block', color: 'text.secondary' }}>
              {drawerContent.sectionTitle}
            </Typography>
            <Stack spacing={2.25}>
              {drawerContent.rows.map((row) => (
                <LabelRowWithIcon
                  key={`${row.label}-${row.icon}`}
                  label={row.label}
                  value={row.value}
                  icon={row.icon}
                />
              ))}
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
