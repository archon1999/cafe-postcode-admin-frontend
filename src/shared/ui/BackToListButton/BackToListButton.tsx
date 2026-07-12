import Button from '@mui/material/Button';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

type BackToListButtonProps = {
  href: string;
};

export function BackToListButton({ href }: BackToListButtonProps) {
  const { t } = useTranslate('common');

  return (
    <Button
      component={RouterLink}
      href={href}
      variant="outlined"
      color="inherit"
      startIcon={<Iconify icon="solar:arrow-left-linear" />}>
      {t('actions.backToList')}
    </Button>
  );
}
