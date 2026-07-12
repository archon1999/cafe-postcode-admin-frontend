import { FormControlLabel, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { useTranslate } from 'app/providers/locales';

import type { PrintTemplateBlock, PrintTemplateColumn, PrintTemplateRow } from '../../../../domain';

type PrintBlockEditorProps = {
  block?: PrintTemplateBlock;
  variables: string[];
  onChange: (block: PrintTemplateBlock) => void;
};

type VariableTarget =
  | { type: 'text' | 'value' }
  | { type: 'rowLabel' | 'rowValue' | 'columnLabel' | 'columnValue'; index: number };

function appendVariable(value: string, variable: string) {
  const separator = value && !value.endsWith(' ') && !value.endsWith('\n') ? ' ' : '';
  return `${value}${separator}{{${variable}}}`;
}

export function PrintBlockEditor({ block, variables, onChange }: PrintBlockEditorProps) {
  const { t } = useTranslate('printing');
  const [variable, setVariable] = useState('');
  const [target, setTarget] = useState<VariableTarget | null>(null);

  useEffect(() => {
    setVariable('');
    if (block?.type === 'text') setTarget({ type: 'text' });
    else if (block?.type === 'qr') setTarget({ type: 'value' });
    else if (block?.rows?.length) setTarget({ type: 'rowValue', index: 0 });
    else if (block?.columns?.length) setTarget({ type: 'columnValue', index: 0 });
    else setTarget(null);
  }, [block?.id, block?.type, block?.rows?.length, block?.columns?.length]);

  if (!block) {
    return <Typography color="text.secondary">{t('messages.selectEditableBlock')}</Typography>;
  }

  const updateRow = (index: number, value: PrintTemplateRow) => {
    const rows = [...(block.rows ?? [])];
    rows[index] = value;
    onChange({ ...block, rows });
  };
  const updateColumn = (index: number, value: PrintTemplateColumn) => {
    const columns = [...(block.columns ?? [])];
    columns[index] = value;
    onChange({ ...block, columns });
  };

  const insertVariable = (selectedVariable: string) => {
    if (!target) return;
    if (target.type === 'text') onChange({ ...block, text: appendVariable(block.text ?? '', selectedVariable) });
    else if (target.type === 'value')
      onChange({ ...block, value: appendVariable(block.value ?? '', selectedVariable) });
    else if (target.type === 'rowLabel') {
      const row = block.rows?.[target.index];
      if (row) updateRow(target.index, { ...row, label: appendVariable(row.label, selectedVariable) });
    } else if (target.type === 'rowValue') {
      const row = block.rows?.[target.index];
      if (row) updateRow(target.index, { ...row, value: appendVariable(row.value, selectedVariable) });
    } else if (target.type === 'columnLabel') {
      const column = block.columns?.[target.index];
      if (column) updateColumn(target.index, { ...column, label: appendVariable(column.label, selectedVariable) });
    } else {
      const column = block.columns?.[target.index];
      if (column) updateColumn(target.index, { ...column, value: appendVariable(column.value, selectedVariable) });
    }
    setVariable('');
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">{t('sections.settings')}</Typography>
      {block.type === 'text' ? (
        <TextField
          label={t('fields.text')}
          value={block.text ?? ''}
          multiline
          minRows={2}
          onFocus={() => setTarget({ type: 'text' })}
          onChange={(event) => onChange({ ...block, text: event.target.value })}
        />
      ) : null}
      {block.type === 'text' || block.type === 'items_table' ? (
        <Select
          size="small"
          value={block.size ?? 'normal'}
          onChange={(event) => onChange({ ...block, size: event.target.value as PrintTemplateBlock['size'] })}>
          <MenuItem value="normal">{t('fontSizes.normal')}</MenuItem>
          <MenuItem value="large">{t('fontSizes.large')}</MenuItem>
        </Select>
      ) : null}
      {block.type === 'qr' ? (
        <TextField
          label={t('fields.value')}
          value={block.value ?? ''}
          onFocus={() => setTarget({ type: 'value' })}
          onChange={(event) => onChange({ ...block, value: event.target.value })}
        />
      ) : null}
      {(block.type === 'text' || block.type === 'qr') && (
        <Select
          size="small"
          value={block.align ?? 'left'}
          onChange={(event) => onChange({ ...block, align: event.target.value as PrintTemplateBlock['align'] })}>
          <MenuItem value="left">{t('align.left')}</MenuItem>
          <MenuItem value="center">{t('align.center')}</MenuItem>
          <MenuItem value="right">{t('align.right')}</MenuItem>
        </Select>
      )}
      {block.type === 'text' ? (
        <FormControlLabel
          control={
            <Switch checked={Boolean(block.bold)} onChange={(_, checked) => onChange({ ...block, bold: checked })} />
          }
          label={t('fields.bold')}
        />
      ) : null}
      {(block.rows ?? []).map((row, index) => (
        <Stack key={`${block.id}-row-${index}`} direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <TextField
            size="small"
            label={t('fields.label')}
            value={row.label}
            onFocus={() => setTarget({ type: 'rowLabel', index })}
            onChange={(event) => updateRow(index, { ...row, label: event.target.value })}
          />
          <TextField
            size="small"
            fullWidth
            label={t('fields.value')}
            value={row.value}
            onFocus={() => setTarget({ type: 'rowValue', index })}
            onChange={(event) => updateRow(index, { ...row, value: event.target.value })}
          />
        </Stack>
      ))}
      {(block.columns ?? []).map((column, index) => (
        <Stack key={`${block.id}-column-${index}`} direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <TextField
            size="small"
            label={t('fields.label')}
            value={column.label}
            onFocus={() => setTarget({ type: 'columnLabel', index })}
            onChange={(event) => updateColumn(index, { ...column, label: event.target.value })}
          />
          <TextField
            size="small"
            fullWidth
            label={t('fields.value')}
            value={column.value}
            onFocus={() => setTarget({ type: 'columnValue', index })}
            onChange={(event) => updateColumn(index, { ...column, value: event.target.value })}
          />
        </Stack>
      ))}
      <Stack spacing={1}>
        <Typography variant="subtitle2">{t('sections.variables')}</Typography>
        <Select
          displayEmpty
          size="small"
          value={variable}
          disabled={!target}
          onChange={(event) => {
            const selectedVariable = event.target.value;
            setVariable(selectedVariable);
            insertVariable(selectedVariable);
          }}>
          <MenuItem value="" disabled>
            {t('fields.selectVariable')}
          </MenuItem>
          {variables.map((item) => (
            <MenuItem key={item} value={item}>
              {item} — {t(`variableTitles.${item}`)}
            </MenuItem>
          ))}
        </Select>
      </Stack>
    </Stack>
  );
}
