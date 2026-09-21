import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';

import { useFeeCatalog } from '../../application';
import type { FormulaDefinition } from '../../domain';

import { FormulaEditor } from './FormulaEditor';

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
  const [open, setOpen] = useState(false);
  const { catalog } = useFeeCatalog(open);
  const definition: FormulaDefinition = {
    name: String(value.name ?? t('fields.serviceFeeEnabled')),
    source: String(value.source ?? ''),
    timezone: String(value.timezone ?? 'Asia/Tashkent'),
    parameters: Object.fromEntries(
      Object.entries((value.parameters as Record<string, unknown>) ?? {}).map(([key, amount]) => [key, String(amount)]),
    ),
  };
  return (
    <>
      <Button
        type="button"
        variant="soft"
        color="inherit"
        sx={{ alignSelf: 'stretch', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 40 }}
        onClick={() => setOpen(true)}>
        {t('serviceFees.viewFormula')}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{t('serviceFees.viewFormula')}</DialogTitle>
        <DialogContent dividers>
          {catalog.error ? (
            <Alert
              severity="error"
              action={<Button onClick={() => void catalog.refetch()}>{t('serviceFees.retry')}</Button>}>
              {catalog.error.message}
            </Alert>
          ) : catalog.data && open ? (
            <FormulaEditor
              catalog={catalog.data}
              initialDefinition={definition}
              canWrite={!disabled}
              onApply={(updated) => {
                onChange({ ...updated });
                setOpen(false);
              }}
            />
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('serviceFees.close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
