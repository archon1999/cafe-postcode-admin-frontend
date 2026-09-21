import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';

import { useTranslate } from 'app/providers/locales';

import { useFeeEditor } from '../../application';
import { FeeAuthoringError, type FeeCatalog, type FeePolicy } from '../../domain';

import { FormulaAI } from './FormulaAI';
import { FormulaBuilder } from './FormulaBuilder';
import { FormulaPreview } from './FormulaPreview';

export function FormulaEditor({
  policy,
  catalog,
  canWrite,
  onSaved,
}: {
  policy?: FeePolicy;
  catalog: FeeCatalog;
  canWrite: boolean;
  onSaved: (policy: FeePolicy) => void;
}) {
  const { t } = useTranslate('organizations');
  const editor = useFeeEditor(policy, catalog.defaultTimezone, onSaved);
  const [tab, setTab] = useState('technical');
  const [templateId, setTemplateId] = useState(catalog.templates[0]?.id ?? '');
  const input = useRef<HTMLTextAreaElement>(null);
  const template = catalog.templates.find((item) => item.id === templateId);
  function insert(text: string) {
    const start = input.current?.selectionStart ?? editor.source.length;
    const end = input.current?.selectionEnd ?? start;
    editor.setSource(editor.source.slice(0, start) + text + editor.source.slice(end));
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(start + text.length, start + text.length);
    });
  }
  return (
    <Stack spacing={3}>
      <TextField
        required
        label={t('serviceFees.name')}
        value={editor.name}
        disabled={!canWrite || editor.busy}
        onChange={(event) => editor.setName(event.target.value)}
        inputProps={{ maxLength: 120 }}
      />
      <TextField
        label={t('serviceFees.timezone')}
        value={editor.timezone}
        disabled={!canWrite || editor.busy}
        onChange={(event) => editor.setTimezone(event.target.value)}
      />
      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable">
        {['technical', 'templates', 'builder', 'ai'].map((value) => (
          <Tab key={value} value={value} label={t(`serviceFees.${value}`)} />
        ))}
      </Tabs>
      {tab === 'templates' && (
        <Stack spacing={2}>
          <TextField
            select
            label={t('serviceFees.templates')}
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}>
            {catalog.templates.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {t(`serviceFees.templateNames.${item.id}`, { defaultValue: item.name })}
              </MenuItem>
            ))}
          </TextField>
          {template && (
            <Typography component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {template.source}
            </Typography>
          )}
          <Button
            disabled={!canWrite || editor.busy || !template}
            onClick={() => {
              if (template)
                editor.apply({ ...template, name: editor.name || t(`serviceFees.templateNames.${template.id}`) });
              setTab('technical');
            }}>
            {t('serviceFees.useTemplate')}
          </Button>
        </Stack>
      )}
      {tab === 'builder' && canWrite && (
        <FormulaBuilder
          onApply={(value) => {
            editor.apply(value);
            setTab('technical');
          }}
        />
      )}
      {tab === 'ai' && canWrite && (
        <FormulaAI
          available={catalog.aiAvailable}
          timezone={editor.timezone}
          onApply={(value) => {
            editor.apply(value);
            setTab('technical');
          }}
        />
      )}
      <TextField
        multiline
        minRows={7}
        maxRows={22}
        label={t('serviceFees.source')}
        value={editor.source}
        inputRef={input}
        disabled={!canWrite || editor.busy}
        onChange={(event) => editor.setSource(event.target.value)}
        inputProps={{
          maxLength: 8000,
          spellCheck: false,
          style: { fontFamily: 'monospace', fontSize: 14, lineHeight: 1.6, tabSize: 2 },
        }}
        helperText={t('serviceFees.sourceHint')}
      />
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t('serviceFees.variables')}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {catalog.variables.map((variable) => (
            <Chip
              key={variable.name}
              size="small"
              label={variable.name}
              title={variable.type}
              disabled={!canWrite || editor.busy}
              onClick={() => insert(variable.name)}
            />
          ))}
        </Stack>
      </Box>
      <TextField
        select
        label={t('serviceFees.functions')}
        value=""
        disabled={!canWrite || editor.busy}
        onChange={(event) => insert(event.target.value)}>
        {catalog.functions.map((fn) => (
          <MenuItem
            key={fn.name}
            value={
              fn.name === 'minutes_in'
                ? 'minutes_in("09:00", "18:00")'
                : fn.name === 'time_in'
                  ? 'time_in(session.started_at, "09:00", "18:00")'
                  : `${fn.name}()`
            }>
            {fn.signature}
          </MenuItem>
        ))}
      </TextField>
      <Stack spacing={1}>
        <Typography variant="subtitle2">{t('serviceFees.parameters')}</Typography>
        {editor.parameters.map(([key, value], index) => (
          <Stack key={index} direction="row" spacing={1}>
            <TextField
              size="small"
              label={t('serviceFees.parameterName')}
              value={key}
              disabled={!canWrite || editor.busy}
              onChange={(event) =>
                editor.setParameters(
                  editor.parameters.map((row, rowIndex) => (rowIndex === index ? [event.target.value, row[1]] : row)),
                )
              }
            />
            <TextField
              size="small"
              label={t('serviceFees.parameterValue')}
              value={value}
              disabled={!canWrite || editor.busy}
              onChange={(event) =>
                editor.setParameters(
                  editor.parameters.map((row, rowIndex) => (rowIndex === index ? [row[0], event.target.value] : row)),
                )
              }
            />
            <Button
              size="small"
              color="error"
              disabled={!canWrite || editor.busy}
              onClick={() => editor.setParameters(editor.parameters.filter((_, rowIndex) => rowIndex !== index))}>
              {t('serviceFees.remove')}
            </Button>
          </Stack>
        ))}
        <Button
          disabled={!canWrite || editor.busy || editor.parameters.length >= 32}
          onClick={() => editor.setParameters([...editor.parameters, ['', '0']])}>
          {t('serviceFees.addParameter')}
        </Button>
      </Stack>
      {editor.error && (
        <Alert severity="error">
          {editor.error.message}
          {editor.error instanceof FeeAuthoringError && editor.error.position !== undefined && (
            <Typography variant="caption">
              {t('serviceFees.errorPosition', { position: editor.error.position + 1 })}
            </Typography>
          )}
        </Alert>
      )}
      <Divider />
      <FormulaPreview
        context={editor.context}
        onChange={editor.setContext}
        result={editor.verified}
        busy={editor.busy || !canWrite}
        onPreview={() => void editor.preview()}
      />
      <FormControlLabel
        label={t('serviceFees.active')}
        control={
          <Switch
            checked={editor.isActive}
            disabled={!canWrite || editor.busy}
            onChange={(_, checked) => editor.setIsActive(checked)}
          />
        }
      />
      <Alert severity="info">{t('serviceFees.versionHint')}</Alert>
      <Button
        variant="contained"
        disabled={!canWrite || !editor.verified || editor.busy}
        onClick={() => void editor.save()}>
        {t('serviceFees.save')}
      </Button>
    </Stack>
  );
}
