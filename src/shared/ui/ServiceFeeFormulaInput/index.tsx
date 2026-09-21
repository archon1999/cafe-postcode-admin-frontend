import { Stack, TextField } from '@mui/material';

import { useTranslate } from 'app/providers/locales';

export function ServiceFeeFormulaInput({
  value = {},
  onChange,
  disabled = false,
}: {
  value?: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslate('organizations');
  const update = (patch: Record<string, unknown>) =>
    onChange({
      version: 1,
      name: t('fields.serviceFeeEnabled'),
      source: '',
      parameters: {},
      timezone: 'Asia/Tashkent',
      ...value,
      ...patch,
    });
  const parameters =
    value.parameters && typeof value.parameters === 'object' ? (value.parameters as Record<string, string>) : {};
  return (
    <Stack spacing={1.5} sx={{ width: '100%', minWidth: 0 }}>
      <TextField
        label={t('serviceFees.name')}
        value={String(value.name ?? '')}
        onChange={(event) => update({ name: event.target.value })}
        disabled={disabled}
      />
      <TextField
        label={t('fields.serviceFeeModeFormula')}
        multiline
        minRows={3}
        maxRows={12}
        value={String(value.source ?? '')}
        placeholder="max(60, duration_minutes) / 60 * 60000"
        helperText={t('serviceFees.inlineFormulaHint')}
        onChange={(event) => update({ source: event.target.value })}
        disabled={disabled}
        slotProps={{ htmlInput: { spellCheck: false, maxLength: 8000 } }}
        sx={{ '& textarea': { fontFamily: 'monospace' } }}
      />
      {Object.entries(parameters).map(([name, amount]) => (
        <TextField
          key={name}
          label={name}
          value={amount}
          disabled={disabled}
          onChange={(event) => update({ parameters: { ...parameters, [name]: event.target.value } })}
        />
      ))}
    </Stack>
  );
}
