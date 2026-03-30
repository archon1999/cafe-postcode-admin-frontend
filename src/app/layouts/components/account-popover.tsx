import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import type { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { usePopover } from 'minimal-shared/hooks';

import { useTranslate } from 'app/providers/locales';
import { useCurrentUser } from 'modules/auth';
import { CustomPopover } from 'shared/ui/CustomPopover';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

export type AccountPopoverProps = IconButtonProps;

export function AccountPopover({ sx, ...other }: AccountPopoverProps) {
  const { t } = useTranslate('common');
  const { open, anchorEl, onClose, onOpen } = usePopover();
  const { user } = useCurrentUser();

  const displayName = user?.displayName ?? t('labels.user');
  const username = user?.username ?? '';
  const photoURL = user?.photoURL ?? '';

  return (
    <>
      <AccountButton onClick={onOpen} photoURL={photoURL} displayName={displayName} sx={sx} {...other} />

      <CustomPopover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        slotProps={{ paper: { sx: { p: 0, width: 220 } }, arrow: { offset: 20 } }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>
          {username && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              @{username}
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <SignOutButton size="medium" variant="text" onClose={onClose} sx={{ display: 'block', textAlign: 'left' }} />
        </Box>
      </CustomPopover>
    </>
  );
}
