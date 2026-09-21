import { Alert, Button, Stack, TextField, Typography } from '@mui/material';

import { useTranslate } from 'app/providers/locales';

import type { FeeContext, FeePreview } from '../../domain';

export function FormulaPreview({
  context,
  onChange,
  result,
  busy,
  onPreview,
}: {
  context: FeeContext;
  onChange: (context: FeeContext) => void;
  result?: FeePreview;
  busy: boolean;
  onPreview: () => void;
}) {
  const { t } = useTranslate('organizations');
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t('serviceFees.preview')}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label={t('serviceFees.subtotal')}
          type="number"
          value={context.subtotal}
          onChange={(event) => onChange({ ...context, subtotal: Number(event.target.value) })}
        />
        <TextField
          label={t('serviceFees.guestCount')}
          type="number"
          value={context.guestCount}
          onChange={(event) => onChange({ ...context, guestCount: Number(event.target.value) })}
        />
      </Stack>
      <TextField
        label={t('serviceFees.startedAt')}
        value={context.startedAt}
        onChange={(event) => onChange({ ...context, startedAt: event.target.value })}
        helperText={t('serviceFees.timestampHint')}
      />
      <TextField
        label={t('serviceFees.calculatedAt')}
        value={context.calculatedAt}
        onChange={(event) => onChange({ ...context, calculatedAt: event.target.value })}
      />
      <Button variant="outlined" disabled={busy} onClick={onPreview}>
        {t('serviceFees.calculate')}
      </Button>
      {result ? (
        <Alert severity="success">
          <Typography variant="h5">{t('serviceFees.amount', { amount: result.amount.toLocaleString() })}</Typography>
          <Typography variant="body2">{t('serviceFees.duration', { minutes: result.durationMinutes })}</Typography>
          {result.bindings.map((binding) => (
            <Typography
              key={binding.name}
              variant="body2"
              sx={{ fontFamily: 'monospace' }}>{`${binding.name} = ${binding.value}`}</Typography>
          ))}
        </Alert>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('serviceFees.previewRequired')}
        </Typography>
      )}
    </Stack>
  );
}
