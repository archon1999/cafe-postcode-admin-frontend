import { Alert, Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';

import { buildFormula, builderError, splitLastShift, type BuilderOptions, type FormulaDefinition } from '../../domain';

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
    shifts: [
      { from: '09:00', until: '18:00', rate: '50000' },
      { from: '18:00', until: '09:00', rate: '100000' },
    ],
    addPercent: false,
    rounding: '1',
  });
  const update = <K extends keyof BuilderOptions>(key: K, value: BuilderOptions[K]) =>
    setOptions({ ...options, [key]: value });
  const amountField = (key: 'percent' | 'hourlyRate' | 'rounding') => (
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
        <Stack spacing={2}>
          {options.shifts.map((shift, index) => (
            <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              {(['from', 'until', 'rate'] as const).map((field) => (
                <TextField
                  key={field}
                  fullWidth
                  type={field === 'rate' ? 'number' : 'time'}
                  label={t(`serviceFees.shift${field === 'from' ? 'From' : field === 'until' ? 'Until' : 'Rate'}`, {
                    number: index + 1,
                  })}
                  value={shift[field]}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(event) =>
                    update(
                      'shifts',
                      options.shifts.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, [field]: event.target.value } : row,
                      ),
                    )
                  }
                />
              ))}
              <Button
                color="error"
                disabled={options.shifts.length <= 2}
                onClick={() => {
                  const remaining = options.shifts
                    .filter((_, rowIndex) => rowIndex !== index)
                    .map((row) => ({ ...row }));
                  if (index === 0) remaining[0].from = shift.from;
                  else remaining[index - 1].until = shift.until;
                  update('shifts', remaining);
                }}>
                {t('serviceFees.remove')}
              </Button>
            </Stack>
          ))}
          <Button
            disabled={options.shifts.length >= 12 || splitLastShift(options.shifts) === options.shifts}
            onClick={() => update('shifts', splitLastShift(options.shifts))}>
            {t('serviceFees.addShift')}
          </Button>
          <TextField
            select
            label={t('serviceFees.hourlyRule')}
            value={options.hourlyRule === 'minimum' ? 'minimum' : 'prorated'}
            onChange={(event) => update('hourlyRule', event.target.value as BuilderOptions['hourlyRule'])}>
            <MenuItem value="prorated">{t('serviceFees.prorated')}</MenuItem>
            <MenuItem value="minimum">{t('serviceFees.arrivalMinimum')}</MenuItem>
          </TextField>
        </Stack>
      )}
      {
        <FormControlLabel
          label={t('serviceFees.addPercent')}
          control={<Checkbox checked={options.addPercent} onChange={(_, checked) => update('addPercent', checked)} />}
        />
      }
      {options.addPercent && amountField('percent')}
      {amountField('rounding')}
      {builderError(options) && <Alert severity="warning">{t(`serviceFees.${builderError(options)}`)}</Alert>}
      <Button disabled={!!builderError(options)} onClick={() => onApply(buildFormula(options))}>
        {t('serviceFees.useBuilder')}
      </Button>
    </Stack>
  );
}
