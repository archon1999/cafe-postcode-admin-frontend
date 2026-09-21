import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';

import { useServiceFees } from '../../application';

import { FormulaAssignments } from './FormulaAssignments';
import { FormulaEditor } from './FormulaEditor';

export function ServiceFeesWorkspace() {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const { scope, catalog, policies, assignments } = useServiceFees();
  const [selectedId, setSelectedId] = useState('');
  const [editorGeneration, setEditorGeneration] = useState(0);
  const [saved, setSaved] = useState(false);
  const canWrite = !!(profile?.isSuperuser || profile?.permissionCodes?.includes('restaurant_settings.update'));
  const error = catalog.error ?? policies.error ?? assignments.error;
  if (error)
    return (
      <Alert
        severity="error"
        action={
          <Button
            onClick={() => {
              void catalog.refetch();
              void policies.refetch();
              void assignments.refetch();
            }}>
            {t('serviceFees.retry')}
          </Button>
        }>
        {error.message}
      </Alert>
    );
  if (!catalog.data || !policies.data || !assignments.data) return <CircularProgress />;
  const selected = policies.data.find((policy) => policy.id === selectedId);
  return (
    <Stack spacing={3}>
      {saved && (
        <Alert severity="success" onClose={() => setSaved(false)}>
          {t('serviceFees.saved')}
        </Alert>
      )}
      <FormulaAssignments assignments={assignments.data} policies={policies.data} canWrite={canWrite} />
      <Accordion>
        <AccordionSummary>{t('serviceFees.formulaTools')}</AccordionSummary>
        <AccordionDetails>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label={t('serviceFees.policy')}
                    value={selectedId}
                    onChange={(event) => {
                      setSelectedId(event.target.value);
                      setSaved(false);
                    }}>
                    <MenuItem value="">{t('serviceFees.newPolicy')}</MenuItem>
                    {policies.data.map((policy) => (
                      <MenuItem key={policy.id} value={policy.id}>
                        {policy.name}
                        {policy.isActive ? '' : ` (${t('serviceFees.disabled')})`}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    disabled={!canWrite}
                    onClick={() => {
                      setSelectedId('');
                      setEditorGeneration((value) => value + 1);
                      setSaved(false);
                    }}>
                    {t('serviceFees.newPolicy')}
                  </Button>
                </Stack>
                <FormulaEditor
                  key={`${scope}:${selected?.id ?? 'new'}:${editorGeneration}`}
                  policy={selected}
                  catalog={catalog.data}
                  canWrite={canWrite}
                  onSaved={(policy) => {
                    setSelectedId(policy.id);
                    setEditorGeneration((value) => value + 1);
                    setSaved(true);
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
