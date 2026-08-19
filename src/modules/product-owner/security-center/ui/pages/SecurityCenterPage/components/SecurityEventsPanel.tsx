import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';
import { formatDateTime } from 'shared/utils/format-time';

import { useAcknowledgeSecurityEventMutation, useSecurityEventsQuery } from '../../../../application';
import type { SecuritySeverity } from '../../../../domain';
import { SecurityStatusChip } from '../../../shared';

const PAGE_SIZE = 20;

function eventLabel(t: TFunction, eventType: string) {
  return t(`eventTypes.${eventType.toLocaleLowerCase()}`, { defaultValue: eventType });
}

export function SecurityEventsPanel() {
  const { t } = useTranslate('security-center');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<SecuritySeverity | ''>('');
  const [acknowledged, setAcknowledged] = useState<'' | 'true' | 'false'>('false');
  const query = useSecurityEventsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search.trim() || undefined,
    severity: severity || undefined,
    acknowledged: acknowledged === '' ? undefined : acknowledged === 'true',
  });
  const acknowledgeMutation = useAcknowledgeSecurityEventMutation();

  const acknowledge = async (eventId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(eventId);
      toast.success(t('events.messages.acknowledged'));
    } catch {
      toast.error(t('events.messages.acknowledgeFailed'));
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField
          fullWidth
          label={t('common.search')}
          placeholder={t('events.searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <FormControl sx={{ minWidth: 170 }}>
          <InputLabel>{t('events.severity')}</InputLabel>
          <Select
            value={severity}
            label={t('events.severity')}
            onChange={(event) => {
              setSeverity(event.target.value as SecuritySeverity | '');
              setPage(1);
            }}>
            <MenuItem value="">{t('common.all')}</MenuItem>
            {(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((value) => (
              <MenuItem key={value} value={value}>
                {t(`severities.${value}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>{t('events.reviewState')}</InputLabel>
          <Select
            value={acknowledged}
            label={t('events.reviewState')}
            onChange={(event) => {
              setAcknowledged(event.target.value as '' | 'true' | 'false');
              setPage(1);
            }}>
            <MenuItem value="false">{t('events.unreviewed')}</MenuItem>
            <MenuItem value="true">{t('events.reviewed')}</MenuItem>
            <MenuItem value="">{t('common.all')}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Stack spacing={1}>
        {query.isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void query.refetch()}>
                {t('events.retry')}
              </Button>
            }>
            {t('events.loadError')}
          </Alert>
        )}
        {(query.data?.items ?? []).map((event) => (
          <Accordion key={event.id} variant="outlined" disableGutters>
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} width="100%">
                <SecurityStatusChip status={event.severity} label={t(`severities.${event.severity}`)} />
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                  {eventLabel(t, event.eventType)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                  {event.restaurantName || t('devices.platform')} · {formatDateTime(event.createdAt)}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                <Typography variant="body2">
                  {t('events.result')}: {event.result || '—'} · {t('events.ip')}: {event.clientIp || '—'}
                </Typography>
                <Typography variant="body2">
                  {t('events.actor')}: {event.actorName || '—'} · {t('events.requestId')}: {event.requestId || '—'}
                </Typography>
                {Object.keys(event.metadata).length > 0 && (
                  <Typography
                    component="pre"
                    variant="caption"
                    sx={{ m: 0, p: 1.5, bgcolor: 'background.neutral', borderRadius: 1, overflowX: 'auto' }}>
                    {JSON.stringify(event.metadata, null, 2)}
                  </Typography>
                )}
                {!event.acknowledgedAt && (
                  <Button
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start' }}
                    loading={acknowledgeMutation.isPending && acknowledgeMutation.variables === event.id}
                    disabled={acknowledgeMutation.isPending && acknowledgeMutation.variables !== event.id}
                    onClick={() => void acknowledge(event.id)}>
                    {t('events.acknowledge')}
                  </Button>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
        {!query.isLoading && !query.isError && !query.data?.items.length && (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
            {t('events.empty')}
          </Typography>
        )}
      </Stack>
      {(query.data?.total ?? 0) > PAGE_SIZE && (
        <Pagination
          page={page}
          count={Math.ceil((query.data?.total ?? 0) / PAGE_SIZE)}
          onChange={(_event, value) => setPage(value)}
          sx={{ alignSelf: 'center' }}
        />
      )}
    </Stack>
  );
}
