import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { RoutePath } from 'app/routes';
import { PageNotFoundIllustration } from 'shared/assets/illustrations';
import { RouterLink } from 'shared/ui/RouterLink';

export const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Container
      maxWidth="md"
      sx={{
        flexGrow: 1,
        display: 'flex',
        py: { xs: 12, sm: 16 },
      }}>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={{ xs: 4, sm: 6 }}
        sx={{ width: 1, textAlign: 'center' }}>
        <Typography variant="h1" sx={{ color: 'primary.main', fontWeight: 700 }}>
          404
        </Typography>

        <Stack spacing={2} sx={{ width: 1, maxWidth: 520 }}>
          <Typography variant="h3">{t('notFound.title')}</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{t('notFound.description')}</Typography>
        </Stack>

        <PageNotFoundIllustration sx={{ width: { xs: 260, sm: 320 } }} />

        <Button component={RouterLink} href={RoutePath.main} size="large" variant="contained">
          {t('notFound.action')}
        </Button>
      </Stack>
    </Container>
  );
};
