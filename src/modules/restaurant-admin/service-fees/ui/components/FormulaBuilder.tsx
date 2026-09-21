import { Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';

import { buildFormula, type BuilderOptions, type FormulaDefinition } from '../../domain';

export function FormulaBuilder({
  onApply,
}: {
  onApply: (value: Pick<FormulaDefinition, 'source' | 'parameters'>) => void;
}) {
  const { t } = useTranslate('organizations');
  const [options, setOptions] = useState<BuilderOptions>({
    kind: 'hourly',
    hourlyRule: 'prorated',
    percent: '10',
    hourlyRate: '60000',
    dayRate: '60000',
    nightRate: '120000',
    from: '09:00',
    until: '18:00',
    addPercent: false,
    rounding: '1',
  });
  const update = <K extends keyof BuilderOptions>(key: K, value: BuilderOptions[K]) =>
    setOptions({ ...options, [key]: value });
  const amountField = (key: 'percent' | 'hourlyRate' | 'dayRate' | 'nightRate' | 'rounding') => (
    <TextField
      key={key}
      label={t(`serviceFees.${key}`)}
      value={options[key]}
      type="number"
      onChange={(event) => update(key, event.target.value)}
    />
  );
  return (
    <Stack spacing={2}>
      <TextField
        select
        label={t('serviceFees.kind')}
        value={options.kind}
        onChange={(event) => update('kind', event.target.value as BuilderOptions['kind'])}>
        {(['hourly', 'scheduled'] as const).map((kind) => (
          <MenuItem key={kind} value={kind}>
            {t(`serviceFees.${kind}`)}
          </MenuItem>
        ))}
      </TextField>
      {options.kind === 'hourly' && (
        <>
          {amountField('hourlyRate')}
          <TextField
            select
            label={t('serviceFees.hourlyRule')}
            value={options.hourlyRule}
            onChange={(event) => update('hourlyRule', event.target.value as BuilderOptions['hourlyRule'])}>
            {(['prorated', 'minimum', 'started'] as const).map((rule) => (
              <MenuItem key={rule} value={rule}>
                {t(`serviceFees.${rule}`)}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}
      {options.kind === 'scheduled' && (
        <>
          <Stack direction="row" spacing={2}>
            <TextField
              type="time"
              label={t('serviceFees.from')}
              value={options.from}
              onChange={(event) => update('from', event.target.value)}
            />
            <TextField
              type="time"
              label={t('serviceFees.until')}
              value={options.until}
              onChange={(event) => update('until', event.target.value)}
            />
          </Stack>
          {amountField('dayRate')}
          {amountField('nightRate')}
        </>
      )}
      {
        <FormControlLabel
          label={t('serviceFees.addPercent')}
          control={<Checkbox checked={options.addPercent} onChange={(_, checked) => update('addPercent', checked)} />}
        />
      }
      {options.addPercent && amountField('percent')}
      {amountField('rounding')}
      <Button onClick={() => onApply(buildFormula(options))}>{t('serviceFees.useBuilder')}</Button>
    </Stack>
  );
}
