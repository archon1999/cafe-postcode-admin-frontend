import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import { useAuthStore, useLogoutMutation } from 'modules/auth';
import { useRouter } from 'shared/hooks/router';

type Props = ButtonProps & {
  onClose?: () => void;
};

export function SignOutButton({ onClose, sx, ...other }: Props) {
  const { t } = useTranslate('common');
  const router = useRouter();

  const { checkAuth, logout } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      await logout();
      await checkAuth();

      onClose?.();
      void router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Unable to logout!');
    }
  }, [checkAuth, logout, logoutMutation, onClose, router]);

  return (
    <Button fullWidth variant="soft" size="large" color="error" onClick={handleLogout} sx={sx} {...other}>
      {t('actions.logout')}
    </Button>
  );
}
