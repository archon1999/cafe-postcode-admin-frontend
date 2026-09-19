import { Alert, Button, Stack } from '@mui/material';

import { useTranslate } from 'app/providers/locales';

import { useLinkCatalogBotMutation } from '../../application';

import { errorText } from './assistant-errors';

export function CatalogBotLink() {
  const { t } = useTranslate('catalog');
  const bot = useLinkCatalogBotMutation();
  return (
    <Stack spacing={1} alignItems="flex-start">
      <Button
        variant="soft"
        color="inherit"
        loading={bot.isPending}
        onClick={() => bot.mutate(undefined, { onSuccess: ({ url }) => window.location.assign(url) })}>
        {t('assistant.telegram')}
      </Button>
      {bot.error && <Alert severity="error">{errorText(bot.error)}</Alert>}
    </Stack>
  );
}
