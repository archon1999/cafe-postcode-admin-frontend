import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import { useAdminRestaurantScopeId } from 'modules/auth';
import type { AdminPrepStation, AdminPrepStationPayload } from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';
import { Form, RHFMultiSelect, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import { useCreatePrepStationMutation, useUpdatePrepStationMutation } from '../../application';
import { ORGANIZATION_PREP_STATION_KIND_VALUES } from '../../domain';

const schema = z.object({
  name: z.string().min(1),
  kind: z.enum(ORGANIZATION_PREP_STATION_KIND_VALUES),
  printerIntegration: z.string().optional(),
  cookIds: z.array(z.string()).default([]),
  isActive: z.boolean(),
});

type Values = z.infer<typeof schema>;
const KITCHEN_COOK_ROLE_CODES = new Set(['chef', 'barman', 'head_chef']);

function getPrinterIntegrationLabel(integration: {
  id?: string;
  provider: string;
  displayName?: string;
  display_name?: string;
  settings: Record<string, unknown>;
}) {
  if (integration.displayName || integration.display_name) {
    return integration.displayName ?? integration.display_name;
  }

  const connectionType = integration.settings.connection_type ?? integration.settings.connectionType;
  const printerName = integration.settings.printer_name ?? integration.settings.printerName;
  const host = integration.settings.host;
  const port = integration.settings.port;

  if (host) {
    return `${integration.provider} (LAN TCP/IP: ${String(host)}${port ? `:${String(port)}` : ''})`;
  }
  if (printerName) {
    return `${integration.provider} (Windows/USB: ${String(printerName)})`;
  }
  if (connectionType) {
    return `${integration.provider} (${String(connectionType)})`;
  }
  return integration.id ? `${integration.provider} (${integration.id.slice(-6)})` : integration.provider;
}

export function RestaurantPrepStationDialog({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: AdminPrepStation | null;
  onClose: () => void;
}) {
  const { t } = useTranslate('organizations');
  const isEditMode = Boolean(item);
  const restaurantId = useAdminRestaurantScopeId();
  const createMutation = useCreatePrepStationMutation();
  const updateMutation = useUpdatePrepStationMutation(item?.id ?? '');
  const printerIntegrationsQuery = useQuery({
    queryKey: ['prep-station-printer-integrations', restaurantId],
    queryFn: () => apiClient.getAdminIntegrationConfigs({ page: 1, pageSize: 100, kindIn: 'printer', isEnabled: true }),
    enabled: Boolean(restaurantId),
  });
  const cooksQuery = useQuery({
    queryKey: ['prep-station-cooks', restaurantId],
    queryFn: () => apiClient.getAdminEmployees({ page: 1, pageSize: 500 }),
    enabled: Boolean(restaurantId),
  });
  const cookOptions = useMemo(
    () =>
      (cooksQuery.data?.data ?? [])
        .filter((cook) => cook.role?.code && KITCHEN_COOK_ROLE_CODES.has(cook.role.code))
        .map((cook) => ({ value: cook.id, label: cook.fullName || cook.username })),
    [cooksQuery.data?.data],
  );

  const methods = useForm<Values>({
    resolver: zodResolver(schema) as Resolver<Values>,
    defaultValues: { name: '', kind: 'kitchen', printerIntegration: '', cookIds: [], isActive: true },
  });

  useEffect(() => {
    methods.reset({
      name: item?.name ?? '',
      kind: item?.kind ?? 'kitchen',
      printerIntegration: item?.printerIntegration ?? '',
      cookIds: item?.cooks?.map((cook) => cook.id) ?? [],
      isActive: item?.isActive ?? true,
    });
  }, [item, methods, open]);

  useEffect(() => {
    if (!open || cooksQuery.isLoading) {
      return;
    }

    const allowedCookIds = new Set(cookOptions.map((option) => option.value));
    const currentCookIds = methods.getValues('cookIds');
    const nextCookIds = currentCookIds.filter((cookId) => allowedCookIds.has(cookId));
    if (nextCookIds.length !== currentCookIds.length) {
      methods.setValue('cookIds', nextCookIds, { shouldDirty: true });
    }
  }, [cookOptions, cooksQuery.isLoading, methods, open]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const allowedCookIds = new Set(cookOptions.map((option) => option.value));
    const payload: AdminPrepStationPayload = {
      name: values.name.trim(),
      kind: values.kind,
      printerIntegration: values.printerIntegration || null,
      cookIds: values.cookIds.filter((cookId) => allowedCookIds.has(cookId)),
      isActive: values.isActive,
    };

    if (isEditMode && item) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  });

  return (
    <Dialog open={open} onClose={methods.formState.isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{isEditMode ? t('pages.prepStationEdit.title') : t('pages.prepStationCreate.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField<Values> name="name" label={t('fields.name')} />
            <RHFSelect<Values> name="kind" label={t('fields.kind')}>
              {ORGANIZATION_PREP_STATION_KIND_VALUES.map((kind) => (
                <MenuItem key={kind} value={kind}>
                  {t(`prepStationKinds.${kind}`)}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect<Values> name="printerIntegration" label={t('fields.printerIntegration')}>
              <MenuItem value="">{t('labels.notSelected')}</MenuItem>
              {(printerIntegrationsQuery.data?.data ?? [])
                .filter((integration) => integration.kind === 'printer' && integration.isEnabled)
                .map((integration) => (
                  <MenuItem key={integration.id} value={integration.id}>
                    {getPrinterIntegrationLabel(integration)}
                  </MenuItem>
                ))}
            </RHFSelect>
            <RHFMultiSelect<Values>
              name="cookIds"
              label={t('fields.cooks')}
              options={cookOptions}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <RHFSwitch<Values> name="isActive" label={t('fields.status')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button color="inherit" variant="outlined" onClick={onClose} disabled={methods.formState.isSubmitting}>
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button type="submit" variant="contained" color="black" loading={methods.formState.isSubmitting}>
            {isEditMode ? t('actions.save') : t('actions.create')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
