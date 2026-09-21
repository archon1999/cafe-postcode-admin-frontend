import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';

import { useTranslate } from 'app/providers/locales';

import { useFeeEditor } from '../../application';
import { FeeAuthoringError, type FeeCatalog, type FormulaDefinition } from '../../domain';

import { FormulaAI } from './FormulaAI';
import { FormulaBuilder } from './FormulaBuilder';
import { FormulaPreview } from './FormulaPreview';

export function FormulaEditor({
  catalog,
  canWrite,
  initialDefinition,
  onApply,
}: {
  initialDefinition: FormulaDefinition;
  onApply: (definition: FormulaDefinition) => void;
  catalog: FeeCatalog;
  canWrite: boolean;
}) {
  const { t } = useTranslate('organizations');
  const editor = useFeeEditor(undefined, catalog.defaultTimezone, () => undefined, initialDefinition);
  const [tab, setTab] = useState(initialDefinition.source || !canWrite ? 'technical' : 'ai');
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
      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable">
        {(canWrite ? ['ai', 'templates', 'builder', 'technical'] : ['technical']).map((value) => (
          <Tab key={value} value={value} label={t(`serviceFees.${value}`)} />
        ))}
      </Tabs>
      {tab === 'templates' && (
        <Stack spacing={2}>
          <TextField
            size="medium"
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
      {canWrite && (
        <Box hidden={tab !== 'builder'}>
          <FormulaBuilder
            onApply={(value) => {
              editor.apply(value);
              setTab('technical');
            }}
          />
        </Box>
      )}
      {canWrite && (
        <Box hidden={tab !== 'ai'}>
          <FormulaAI
            available={catalog.aiAvailable}
            timezone={editor.timezone}
            onApply={(value) => {
              editor.apply(value);
              setTab('technical');
            }}
          />
        </Box>
      )}
      {tab === 'technical' && (
        <>
          <TextField
            size="medium"
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
          <TextField
            size="medium"
            select
            label={t('serviceFees.variables')}
            value=""
            disabled={!canWrite || editor.busy}
            onChange={(event) => insert(event.target.value)}>
            {[
              ...new Set([
                ...catalog.variables.map((variable) => variable.name),
                ...editor.parameters.map(([name]) => name).filter(Boolean),
              ]),
            ].map((name) => (
              <MenuItem key={name} value={name}>
                {t(`serviceFees.variableNames.${name.split('.').join('_')}`, { defaultValue: name })}
                {catalog.variables.some((variable) => variable.name === name) ? ` (${name})` : ''}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="medium"
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
                  size="medium"
                  label={t('serviceFees.parameterName')}
                  value={key}
                  disabled={!canWrite || editor.busy}
                  onChange={(event) =>
                    editor.setParameters(
                      editor.parameters.map((row, rowIndex) =>
                        rowIndex === index ? [event.target.value, row[1]] : row,
                      ),
                    )
                  }
                />
                <TextField
                  size="medium"
                  label={t('serviceFees.parameterValue')}
                  value={value}
                  disabled={!canWrite || editor.busy}
                  onChange={(event) =>
                    editor.setParameters(
                      editor.parameters.map((row, rowIndex) =>
                        rowIndex === index ? [row[0], event.target.value] : row,
                      ),
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
        </>
      )}
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
      {tab === 'technical' && (
        <>
          <Accordion disableGutters>
            <AccordionSummary>{t('serviceFees.preview')}</AccordionSummary>
            <AccordionDetails>
              <FormulaPreview
                context={editor.context}
                onChange={editor.setContext}
                result={editor.verified}
                busy={editor.busy || !canWrite}
                onPreview={() => void editor.preview()}
              />
            </AccordionDetails>
          </Accordion>
          <Button
            variant="contained"
            disabled={!canWrite || !editor.source.trim() || editor.busy}
            loading={editor.busy}
            onClick={async () => {
              const checked = await editor.preview();
              if (checked) onApply(checked.definition);
            }}>
            {t('serviceFees.applyFormula')}
          </Button>
        </>
      )}
    </Stack>
  );
}
