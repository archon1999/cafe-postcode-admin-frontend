import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { useTranslate } from 'app/providers/locales';
import dayjs, { TASHKENT_TIMEZONE, toTashkentDayjs } from 'shared/utils/dayjs';
import { FORMAT_PATTERNS } from 'shared/utils/format-time';

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
          size="medium"
          label={t('serviceFees.subtotal')}
          type="number"
          value={context.subtotal}
          onChange={(event) => onChange({ ...context, subtotal: Number(event.target.value) })}
        />
        <TextField
          size="medium"
          label={t('serviceFees.guestCount')}
          type="number"
          value={context.guestCount}
          onChange={(event) => onChange({ ...context, guestCount: Number(event.target.value) })}
        />
      </Stack>
      {(['startedAt', 'calculatedAt'] as const).map((field) => (
        <DateTimePicker
          key={field}
          label={t(`serviceFees.${field}`)}
          value={
            context[field] ? (dayjs(context[field]).isValid() ? toTashkentDayjs(context[field]) : dayjs('')) : null
          }
          onChange={(date) =>
            onChange({
              ...context,
              [field]: date ? (date.isValid() ? date.tz(TASHKENT_TIMEZONE).format() : 'Invalid Date') : '',
            })
          }
          timezone={TASHKENT_TIMEZONE}
          ampm={false}
          format={FORMAT_PATTERNS.dateTime}
          slotProps={{ textField: { size: 'medium', fullWidth: true } }}
        />
      ))}
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
