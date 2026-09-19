import { Alert, Button, Stack } from '@mui/material';

import { useTranslate } from 'app/providers/locales';

import { useLinkCatalogBotMutation } from '../../application';

import { errorText } from './assistant-errors';

export function CatalogBotLink() {
  const { t } = useTranslate('catalog');
  const bot = useLinkCatalogBotMutation();
  return (
    <Stack spacing={1} alignItems="flex-start">
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button variant="outlined" loading={bot.isPending} onClick={() => bot.mutate()}>
          {t('assistant.telegram')}
        </Button>
        {bot.data && (
          <Button component="a" href={bot.data.url} target="_blank" rel="noopener noreferrer">
            {t('assistant.openBot')}
          </Button>
        )}
      </Stack>
      {bot.data && <Alert severity="info">{t('assistant.linkHint')}</Alert>}
      {bot.error && <Alert severity="error">{errorText(bot.error)}</Alert>}
    </Stack>
  );
}
