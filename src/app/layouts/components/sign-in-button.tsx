import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';

import { CONFIG } from 'app/config/globalConfig';
import { useTranslate } from 'app/providers/locales';
import { RouterLink } from 'shared/ui/RouterLink';

export function SignInButton({ sx, ...other }: ButtonProps) {
  const { t } = useTranslate('common');

  return (
    <Button component={RouterLink} href={CONFIG.auth.redirectPath} variant="outlined" sx={sx} {...other}>
      {t('auth.signIn')}
    </Button>
  );
}
