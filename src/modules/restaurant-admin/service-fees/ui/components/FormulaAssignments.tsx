import { Alert, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { ServiceFeeFormulaInput } from 'shared/ui/ServiceFeeFormulaInput';

import { useFeeMutations } from '../../application';
import type { AssignmentInput, FeeAssignment, FeePolicy } from '../../domain';

function AssignmentSettings({
  target,
  policies,
  canWrite,
}: {
  target: FeeAssignment;
  policies: FeePolicy[];
  canWrite: boolean;
}) {
  const { t } = useTranslate('organizations');
  const { assign } = useFeeMutations();
  const [mode, setMode] = useState<AssignmentInput['mode']>(
    !target.enabled ? 'none' : target.mode === 'percentage' ? 'percentage' : 'formula',
  );
  const [percent, setPercent] = useState(target.percent);
  const [formula, setFormula] = useState<Record<string, unknown>>({ ...target.formula });
  const [templateId, setTemplateId] = useState('');
  const valid =
    mode === 'none' ||
    (mode === 'percentage'
      ? Number(percent) >= 1 &&
        Number(percent) <= 99 &&
        (target.scope === 'restaurant' || Number.isInteger(Number(percent)))
      : !!String(formula.source ?? '').trim());
  return (
    <Stack spacing={2}>
      <TextField
        select
        label={t('fields.serviceFeeEnabled')}
        value={mode}
        disabled={!canWrite || assign.isPending}
        onChange={(event) => {
          setMode(event.target.value as AssignmentInput['mode']);
          assign.reset();
        }}>
        <MenuItem value="none">{t('fields.serviceFeeModeDisabled')}</MenuItem>
        <MenuItem value="percentage">{t('fields.serviceFeeModePercentage')}</MenuItem>
        <MenuItem value="formula">{t('fields.serviceFeeModeFormula')}</MenuItem>
      </TextField>
      {mode === 'percentage' && (
        <TextField
          label={t('fields.serviceFeePercent')}
          type="number"
          value={percent}
          disabled={!canWrite || assign.isPending}
          slotProps={{ htmlInput: { min: 1, max: 99, step: target.scope === 'restaurant' ? 0.01 : 1 } }}
          helperText={t('serviceFees.percentageReceiptHint')}
          onChange={(event) => {
            setPercent(event.target.value);
            assign.reset();
          }}
        />
      )}
      {mode === 'formula' && (
        <>
          {policies.some((policy) => policy.isActive) && (
            <TextField
              select
              label={t('serviceFees.policy')}
              value={templateId}
              disabled={!canWrite || assign.isPending}
              onChange={(event) => {
                setTemplateId(event.target.value);
                const selected = policies.find((policy) => policy.id === event.target.value);
                if (selected) setFormula({ ...selected.definition });
                assign.reset();
              }}>
              <MenuItem value="">{t('serviceFees.technical')}</MenuItem>
              {policies
                .filter((policy) => policy.isActive)
                .map((policy) => (
                  <MenuItem value={policy.id} key={policy.id}>
                    {policy.name}
                  </MenuItem>
                ))}
            </TextField>
          )}
          <ServiceFeeFormulaInput
            value={formula}
            disabled={!canWrite || assign.isPending}
            onChange={(value) => {
              setFormula(value);
              assign.reset();
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {t('serviceFees.formulaReceiptHint')}
          </Typography>
        </>
      )}
      {assign.error && <Alert severity="error">{assign.error.message}</Alert>}
      {assign.isSuccess && <Alert severity="success">{t('serviceFees.assigned')}</Alert>}
      <Button
        variant="contained"
        disabled={!canWrite || !valid || assign.isPending}
        onClick={() =>
          assign.mutate({
            scope: target.scope,
            targetId: target.id,
            mode,
            ...(mode === 'percentage' ? { percent } : {}),
            ...(mode === 'formula' ? { formula } : {}),
          })
        }>
        {t('serviceFees.applyAssignment')}
      </Button>
    </Stack>
  );
}

export function FormulaAssignments({
  assignments,
  policies,
  canWrite,
}: {
  assignments: FeeAssignment[];
  policies: FeePolicy[];
  canWrite: boolean;
}) {
  const { t } = useTranslate('organizations');
  const [targetKey, setTargetKey] = useState(() => {
    const restaurant = assignments.find((row) => row.scope === 'restaurant');
    return restaurant ? `${restaurant.scope}:${restaurant.id}` : '';
  });
  const target = assignments.find((row) => `${row.scope}:${row.id}` === targetKey);
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">{t('fields.serviceFeeEnabled')}</Typography>
          <TextField
            select
            label={t('serviceFees.target')}
            value={targetKey}
            onChange={(event) => setTargetKey(event.target.value)}>
            {assignments.map((row) => (
              <MenuItem key={`${row.scope}:${row.id}`} value={`${row.scope}:${row.id}`}>
                {`${t(`serviceFees.${row.scope}`)} · ${row.hallName ? `${row.hallName} / ` : ''}${row.name}`}
              </MenuItem>
            ))}
          </TextField>
          {target && <AssignmentSettings key={targetKey} target={target} policies={policies} canWrite={canWrite} />}
          <Typography variant="body2" color="text.secondary">
            {t('serviceFees.assignmentHint')}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
