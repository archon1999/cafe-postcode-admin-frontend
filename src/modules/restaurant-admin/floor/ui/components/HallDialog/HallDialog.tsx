import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import type { AdminHall } from 'shared/api/admin-types';
import { useRedirectOnNotFound } from 'shared/hooks/router';
import { EntityFormActions } from 'shared/ui/EntityFormActions';
import { Form, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';

import {
  useCreateHallMutation,
  useDeleteHallMutation,
  useGetHallByIdQuery,
  useGetZonesQuery,
  useUpdateHallMutation,
} from '../../../application';
import { ZoneDialog } from '../ZoneDialog/ZoneDialog';

import {
  hallDialogDefaultValues,
  type HallDialogFormInput,
  type HallDialogFormValues,
  hallDialogSchema,
  toHallPayload,
} from './hallDialog.form';

type HallDialogProps = {
  open: boolean;
  hallId?: string | null;
  defaultZoneId?: string | null;
  onClose: () => void;
  onSaved?: (hall: AdminHall) => void;
  onDeleted?: () => void;
};

export function HallDialog({ open, hallId, defaultZoneId, onClose, onSaved, onDeleted }: HallDialogProps) {
  const { t } = useTranslate('floor');
  const { profile } = useCurrentUser();
  const isEditMode = Boolean(hallId);
  const [isZoneSelectOpen, setZoneSelectOpen] = useState(false);
  const [isCreateZoneOpen, setCreateZoneOpen] = useState(false);
  const hallQuery = useGetHallByIdQuery(hallId ?? '', { enabled: open && isEditMode });
  const zonesQuery = useGetZonesQuery({ enabled: open });
  const createMutation = useCreateHallMutation();
  const updateMutation = useUpdateHallMutation(hallId ?? '');
  const deleteMutation = useDeleteHallMutation();
  const canCreateZone = Boolean(profile?.isSuperuser || profile?.permissionCodes?.includes('zones.create'));

  useRedirectOnNotFound(hallQuery.error, open && isEditMode);

  const methods = useForm<HallDialogFormInput, unknown, HallDialogFormValues>({
    resolver: zodResolver(hallDialogSchema),
    defaultValues: hallDialogDefaultValues,
  });

  const zoneOptions = useMemo(
    () =>
      [...(zonesQuery.data ?? [])]
        .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.name.localeCompare(right.name))
        .map((zone) => ({
          value: zone.id,
          label: zone.name,
        })),
    [zonesQuery.data],
  );

  useEffect(() => {
    if (!open) {
      methods.reset({ ...hallDialogDefaultValues, zoneOrCabinId: defaultZoneId ?? '' });
      return;
    }

    if (!isEditMode) {
      methods.reset({ ...hallDialogDefaultValues, zoneOrCabinId: defaultZoneId ?? '' });
      return;
    }

    if (!hallQuery.data) {
      return;
    }

    methods.reset({
      name: hallQuery.data.name,
      description: hallQuery.data.description ?? '',
      isActive: hallQuery.data.isActive,
      zoneOrCabinId: hallQuery.data.zoneOrCabinId ?? '',
    });
  }, [defaultZoneId, hallQuery.data, isEditMode, methods, open]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = toHallPayload(values);

    const savedHall =
      isEditMode && hallId ? await updateMutation.mutateAsync(payload) : await createMutation.mutateAsync(payload);

    onSaved?.(savedHall);
    onClose();
  });

  return (
    <>
      <Dialog open={open} onClose={methods.formState.isSubmitting ? undefined : onClose} fullWidth maxWidth="md">
        <Form methods={methods} onSubmit={onSubmit}>
          <DialogTitle>{isEditMode ? t('pages.hallEdit.title') : t('pages.hallCreate.title')}</DialogTitle>
          <DialogContent>
            {isEditMode && hallQuery.isLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                <CircularProgress />
              </Stack>
            ) : (
              <Stack spacing={3} sx={{ pt: 1 }}>
                <RHFTextField<HallDialogFormInput> name="name" label={t('fields.name')} />
                <RHFTextField<HallDialogFormInput>
                  name="description"
                  label={t('fields.description')}
                  multiline
                  rows={3}
                />
                <RHFSelect<HallDialogFormInput>
                  name="zoneOrCabinId"
                  label={t('fields.zone')}
                  slotProps={{
                    select: {
                      open: isZoneSelectOpen,
                      onOpen: () => setZoneSelectOpen(true),
                      onClose: () => setZoneSelectOpen(false),
                    },
                  }}>
                  {canCreateZone ? (
                    <ListSubheader disableSticky sx={{ px: 1.5, py: 1 }}>
                      <Button
                        fullWidth
                        size="small"
                        color="inherit"
                        variant="outlined"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={(event) => {
                          event.stopPropagation();
                          setZoneSelectOpen(false);
                          setCreateZoneOpen(true);
                        }}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}>
                        {t('actions.createZone')}
                      </Button>
                    </ListSubheader>
                  ) : null}
                  <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                  {zoneOptions.map((zone) => (
                    <MenuItem key={zone.value} value={zone.value}>
                      {zone.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <RHFSwitch<HallDialogFormInput> name="isActive" label={t('fields.status')} />
              </Stack>
            )}
          </DialogContent>
          <EntityFormActions
            isDialog
            isEditMode={isEditMode}
            isSubmitting={methods.formState.isSubmitting}
            isDeleting={deleteMutation.isPending}
            submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
            deleteTitle={t('dialogs.deleteHall.title')}
            deleteContent={t('dialogs.deleteHall.description', { name: hallQuery.data?.name ?? '' })}
            onCancel={onClose}
            onDelete={async () => {
              if (!hallId) return;
              await deleteMutation.mutateAsync(hallId);
              (onDeleted ?? onClose)();
            }}
          />
        </Form>
      </Dialog>

      <ZoneDialog
        open={isCreateZoneOpen}
        onClose={() => setCreateZoneOpen(false)}
        onSaved={(zone) => methods.setValue('zoneOrCabinId', zone.id, { shouldDirty: true, shouldValidate: true })}
      />
    </>
  );
}
