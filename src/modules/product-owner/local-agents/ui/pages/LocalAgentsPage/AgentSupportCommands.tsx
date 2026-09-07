import { Alert, Box, Button, Chip, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';

import {
  useAgentSupportCatalog,
  useAgentSupportHistory,
  useAgentSupportRequest,
  useAgentSupportStatus,
  useExecuteAgentSupportCommand,
} from '../../../application';
import { isSupportCommandPending, SupportCommandRejected, type SupportRecord } from '../../../domain';

export function AgentSupportCommands({ agentId, available }: { agentId: string; available: boolean }) {
  const { t } = useTranslate('platform');
  const catalog = useAgentSupportCatalog();
  const history = useAgentSupportHistory(agentId);
  const execution = useExecuteAgentSupportCommand(agentId);
  const saved = useAgentSupportRequest(agentId);
  const status = useAgentSupportStatus(agentId, saved.request?.requestId ?? null);
  const [name, setName] = useState(saved.request?.name ?? 'runtime.inspect');
  const [parameters, setParameters] = useState<Record<string, string>>(saved.request?.parameters ?? {});
  const [selected, setSelected] = useState<SupportRecord | null>(null);
  const command = catalog.data?.commands.find((item) => item.name === name);
  const locked = Boolean(saved.request);
  const busy = execution.isPending || isSupportCommandPending(status.data?.status);
  const valid = Boolean(
    command && command.parameters.every((field) => !field.required || Boolean((parameters[field.name] ?? '').trim())),
  );
  const result = selected ?? status.data;
  const submit = async () => {
    const firstAttempt = !saved.request;
    try {
      const request = saved.prepare(name, parameters);
      setSelected(null);
      await execution.mutateAsync(request);
    } catch (error) {
      if (firstAttempt && error instanceof SupportCommandRejected) {
        // Only a definitive rejection of the first submission permits a new ID.
        // An earlier lost response remains tied to its original request.
        saved.reset();
        toast.error(t('localAgents.commands.rejected'));
        return;
      }
      toast.error(t('localAgents.commands.unknown'));
    }
  };
  return (
    <Stack spacing={2}>
      <Divider />
      <Typography variant="h6">{t('localAgents.commands.title')}</Typography>
      {!available && <Alert severity="info">{t('localAgents.commands.offline')}</Alert>}
      {catalog.isError && <Alert severity="error">{t('localAgents.commands.catalogError')}</Alert>}
      <TextField
        select
        label={t('localAgents.commands.action')}
        value={catalog.data ? name : ''}
        disabled={locked}
        onChange={(event) => {
          setName(event.target.value);
          setParameters({});
        }}>
        {catalog.data?.commands.map((item) => (
          <MenuItem key={item.name} value={item.name}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>
      {command?.parameters.map((field) => (
        <TextField
          key={field.name}
          select={Boolean(field.options)}
          label={field.label}
          required={field.required}
          disabled={locked}
          value={parameters[field.name] ?? ''}
          inputProps={{ maxLength: field.maxLength }}
          onChange={(event) => setParameters((previous) => ({ ...previous, [field.name]: event.target.value }))}>
          {field.options?.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      ))}
      {saved.request && (
        <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>
          {t('localAgents.commands.requestId', { id: saved.request.requestId })}
        </Typography>
      )}
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          disabled={!available || !valid || execution.isPending}
          onClick={() => void submit()}>
          {execution.isPending
            ? t('localAgents.commands.sending')
            : locked
              ? t('localAgents.commands.retry')
              : t('localAgents.commands.execute')}
        </Button>
        {saved.request && (
          <Button disabled={execution.isPending} onClick={() => void status.refetch()}>
            {t('localAgents.commands.status')}
          </Button>
        )}
        {saved.request && !busy && status.data && (
          <Button
            onClick={() => {
              saved.reset();
              execution.reset();
              setSelected(null);
            }}>
            {t('localAgents.commands.new')}
          </Button>
        )}
      </Stack>
      {execution.isError && <Alert severity="warning">{t('localAgents.commands.requestError')}</Alert>}
      {result && (
        <Box>
          <Chip
            label={t(`localAgents.commands.states.${result.status}`, { defaultValue: result.status })}
            color={result.status === 'succeeded' ? 'success' : result.status === 'failed' ? 'error' : 'warning'}
          />
          <Box
            component="pre"
            sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 320, overflow: 'auto', fontSize: 12 }}>
            {JSON.stringify(result.error || result.result, null, 2)}
          </Box>
        </Box>
      )}
      <Typography variant="subtitle2">{t('localAgents.commands.history')}</Typography>
      {history.isError && <Alert severity="error">{t('localAgents.commands.historyError')}</Alert>}
      {history.data?.commands.slice(0, 20).map((item) => (
        <Button
          key={item.requestId}
          onClick={() => setSelected(item)}
          sx={{ justifyContent: 'flex-start', textAlign: 'left' }}>
          {catalog.data?.commands.find((entry) => entry.name === item.name)?.label ?? item.name} ·{' '}
          {t(`localAgents.commands.states.${item.status}`, { defaultValue: item.status })} ·{' '}
          {new Date(item.createdAt).toLocaleString()}
        </Button>
      ))}
    </Stack>
  );
}
