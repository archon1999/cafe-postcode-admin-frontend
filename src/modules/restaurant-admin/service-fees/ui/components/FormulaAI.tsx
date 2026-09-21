import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';

import { useFeeMutations } from '../../application';
import type { FormulaDefinition } from '../../domain';

export function FormulaAI({
  available,
  timezone,
  onApply,
}: {
  available: boolean;
  timezone: string;
  onApply: (value: FormulaDefinition) => void;
}) {
  const { t } = useTranslate('organizations');
  const [text, setText] = useState('');
  const { draft } = useFeeMutations();
  return (
    <Stack spacing={2}>
      <Alert severity="info">{t(available ? 'serviceFees.aiHint' : 'serviceFees.aiUnavailable')}</Alert>
      <TextField
        multiline
        minRows={3}
        label={t('serviceFees.requirement')}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          draft.reset();
        }}
        inputProps={{ maxLength: 4000 }}
        disabled={draft.isPending}
      />
      <Button
        disabled={!available || text.trim().length < 5 || draft.isPending}
        loading={draft.isPending}
        onClick={() => draft.mutate({ text, timezone })}>
        {t('serviceFees.generate')}
      </Button>
      {draft.error && <Alert severity="error">{draft.error.message}</Alert>}
      {draft.data && (
        <>
          <Typography>{draft.data.explanation}</Typography>
          {draft.data.questions.map((question) => (
            <Alert severity="warning" key={question}>
              {question}
            </Alert>
          ))}
          {draft.data.definition && (
            <>
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {draft.data.definition.source}
              </Typography>
              <Button onClick={() => draft.data?.definition && onApply(draft.data.definition)}>
                {t('serviceFees.useDraft')}
              </Button>
            </>
          )}
        </>
      )}
    </Stack>
  );
}
