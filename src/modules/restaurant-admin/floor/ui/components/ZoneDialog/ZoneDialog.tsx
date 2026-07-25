import { zodResolver } from '@hookform/resolvers/zod';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import type { AdminZoneOrCabin } from 'shared/api/admin-types';
import { useRedirectOnNotFound } from 'shared/hooks/router';
import { usePageTitle } from 'shared/hooks/use-page-title';
import { EntityFormActions } from 'shared/ui/EntityFormActions';
import { Form, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import {
  useCreateZoneMutation,
  useDeleteZoneMutation,
  useGetZoneByIdQuery,
  useUpdateZoneMutation,
} from '../../../application';

import {
  toZonePayload,
  type ZoneDialogFormInput,
  type ZoneDialogFormValues,
  zoneDialogDefaultValues,
  zoneDialogSchema,
} from './zoneDialog.form';

type ZoneDialogProps = {
  open: boolean;
  zoneId?: string | null;
  onClose: () => void;
  onSaved?: (zone: AdminZoneOrCabin) => void;
  onDeleted?: () => void;
};

export function ZoneDialog({ open, zoneId, onClose, onSaved, onDeleted }: ZoneDialogProps) {
  const { t } = useTranslate('floor');
  const isEditMode = Boolean(zoneId);
  const zoneQuery = useGetZoneByIdQuery(zoneId ?? '', { enabled: open && isEditMode });
  const createMutation = useCreateZoneMutation();
  const updateMutation = useUpdateZoneMutation(zoneId ?? '');
  const deleteMutation = useDeleteZoneMutation();
  const listTitle = t('pages.zones.title');
  const editTitle = t('pages.zoneEdit.title');
  const createTitle = t('pages.zoneCreate.title');
  const entityTitle = zoneQuery.data?.name;

  useRedirectOnNotFound(zoneQuery.error, open && isEditMode);
  usePageTitle(
    isEditMode
      ? entityTitle
        ? [listTitle, entityTitle, editTitle]
        : [listTitle, editTitle]
      : [listTitle, createTitle],
    {
      enabled: open,
    },
  );

  const methods = useForm<ZoneDialogFormInput, unknown, ZoneDialogFormValues>({
    resolver: zodResolver(zoneDialogSchema),
    defaultValues: zoneDialogDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      methods.reset(zoneDialogDefaultValues);
      return;
    }

    if (!isEditMode) {
      methods.reset(zoneDialogDefaultValues);
      return;
    }

    if (!zoneQuery.data) {
      return;
    }

    methods.reset({
      name: zoneQuery.data.name,
      isActive: zoneQuery.data.isActive,
    });
  }, [isEditMode, methods, open, zoneQuery.data]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = toZonePayload(values);

    const savedZone =
      isEditMode && zoneId ? await updateMutation.mutateAsync(payload) : await createMutation.mutateAsync(payload);

    onSaved?.(savedZone);
    onClose();
  });

  return (
    <Dialog open={open} onClose={methods.formState.isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{isEditMode ? editTitle : createTitle}</DialogTitle>
        <DialogContent>
          {isEditMode && zoneQuery.isLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <Stack spacing={3} sx={{ pt: 1 }}>
              <RHFTextField<ZoneDialogFormInput> name="name" label={t('fields.name')} />
              <RHFSwitch<ZoneDialogFormInput> name="isActive" label={t('fields.status')} />
            </Stack>
          )}
        </DialogContent>
        <EntityFormActions
          isDialog
          isEditMode={isEditMode}
          isSubmitting={methods.formState.isSubmitting}
          isDeleting={deleteMutation.isPending}
          submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
          deleteTitle={t('dialogs.deleteZone.title')}
          deleteContent={t('dialogs.deleteZone.description', { name: zoneQuery.data?.name ?? '' })}
          onCancel={onClose}
          onDelete={async () => {
            if (!zoneId) return;
            await deleteMutation.mutateAsync(zoneId);
            (onDeleted ?? onClose)();
          }}
        />
      </Form>
    </Dialog>
  );
}
