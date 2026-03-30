import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';

import { CONFIG } from 'app/config/globalConfig';
import { RouterLink } from 'shared/ui/RouterLink';

export function SignInButton({ sx, ...other }: ButtonProps) {
  return (
    <Button component={RouterLink} href={CONFIG.auth.redirectPath} variant="outlined" sx={sx} {...other}>
      Sign in
    </Button>
  );
}
