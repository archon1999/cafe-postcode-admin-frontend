import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';

type AdminScopeBlockerProps = {
  requirement: 'restaurant';
};

export function AdminScopeBlocker({ requirement: _requirement }: AdminScopeBlockerProps) {
  const { t } = useTranslate('common');

  const title = t('scope.selectRestaurantTitle');
  const description = t('scope.selectRestaurantDescription');

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Alert severity="info" variant="outlined">
          {title}
        </Alert>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 560 }}>
          {description}
        </Typography>
      </Stack>
    </Card>
  );
}
