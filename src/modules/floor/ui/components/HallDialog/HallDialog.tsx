import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import { useRedirectOnNotFound } from 'shared/hooks/router';
import { Form, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import {
  useCreateHallMutation,
  useGetHallByIdQuery,
  useGetZonesQuery,
  useUpdateHallMutation,
} from '../../../application';

const schema = z.object({
  name: z.string().min(1),
  description: z.string(),
  sortOrder: z.coerce.number().min(0),
  isActive: z.boolean(),
  zoneOrCabinId: z.string().min(1),
});

type Values = z.infer<typeof schema>;

export function HallDialog({ open, hallId, onClose }: { open: boolean; hallId?: string | null; onClose: () => void }) {
  const { t } = useTranslate('floor');
  const isEditMode = Boolean(hallId);
  const hallQuery = useGetHallByIdQuery(hallId ?? '', { enabled: open && isEditMode });
  const zonesQuery = useGetZonesQuery({ enabled: open });
  const createMutation = useCreateHallMutation();
  const updateMutation = useUpdateHallMutation(hallId ?? '');

  useRedirectOnNotFound(hallQuery.error, open && isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', sortOrder: 0, isActive: true, zoneOrCabinId: '' },
  });

  const zoneOptions = useMemo(
    () =>
      [...(zonesQuery.data ?? [])]
        .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.name.localeCompare(right.name))
        .map((zone) => ({
          value: zone.id,
          label: zone.name,
        })),
    [hallId, zonesQuery.data],
  );

  useEffect(() => {
    if (!open) {
      methods.reset({ name: '', description: '', sortOrder: 0, isActive: true, zoneOrCabinId: '' });
      return;
    }

    if (!isEditMode) {
      methods.reset({ name: '', description: '', sortOrder: 0, isActive: true, zoneOrCabinId: '' });
      return;
    }

    if (!hallQuery.data) {
      return;
    }

    methods.reset({
      name: hallQuery.data.name,
      description: hallQuery.data.description ?? '',
      sortOrder: hallQuery.data.sortOrder ?? 0,
      isActive: hallQuery.data.isActive,
      zoneOrCabinId: hallQuery.data.zoneOrCabinId ?? '',
    });
  }, [hallQuery.data, isEditMode, methods, open]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      sortOrder: values.sortOrder,
      isActive: values.isActive,
      zoneOrCabinId: values.zoneOrCabinId,
    };

    if (isEditMode && hallId) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    onClose();
  });

  return (
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
              <RHFTextField<Values> name="name" label={t('fields.name')} />
              <RHFTextField<Values> name="sortOrder" label={t('fields.sortOrder')} type="number" />
              <RHFTextField<Values> name="description" label={t('fields.description')} multiline rows={3} />
              <RHFSelect<Values> name="zoneOrCabinId" label={t('fields.zone')}>
                <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                {zoneOptions.map((zone) => (
                  <MenuItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSwitch<Values> name="isActive" label={t('fields.status')} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button color="inherit" variant="outlined" onClick={onClose} disabled={methods.formState.isSubmitting}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" color="black" loading={methods.formState.isSubmitting}>
            {isEditMode ? t('actions.save') : t('actions.create')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
