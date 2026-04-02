import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import { useRedirectOnNotFound } from 'shared/hooks/router';
import { Form, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import { useCreateZoneMutation, useGetZoneByIdQuery, useUpdateZoneMutation } from '../../../application';

const schema = z.object({
  name: z.string().min(1),
  sortOrder: z.coerce.number().min(0),
  isActive: z.boolean(),
});

type Values = z.infer<typeof schema>;

export function ZoneDialog({ open, zoneId, onClose }: { open: boolean; zoneId?: string | null; onClose: () => void }) {
  const { t } = useTranslate('floor');
  const isEditMode = Boolean(zoneId);
  const zoneQuery = useGetZoneByIdQuery(zoneId ?? '', { enabled: open && isEditMode });
  const createMutation = useCreateZoneMutation();
  const updateMutation = useUpdateZoneMutation(zoneId ?? '');

  useRedirectOnNotFound(zoneQuery.error, open && isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', sortOrder: 0, isActive: true },
  });

  useEffect(() => {
    if (!open) {
      methods.reset({ name: '', sortOrder: 0, isActive: true });
      return;
    }

    if (!isEditMode) {
      methods.reset({ name: '', sortOrder: 0, isActive: true });
      return;
    }

    if (!zoneQuery.data) {
      return;
    }

    methods.reset({
      name: zoneQuery.data.name,
      sortOrder: zoneQuery.data.sortOrder,
      isActive: zoneQuery.data.isActive,
    });
  }, [isEditMode, methods, open, zoneQuery.data]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    if (isEditMode && zoneId) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    onClose();
  });

  return (
    <Dialog open={open} onClose={methods.formState.isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{isEditMode ? t('pages.zoneEdit.title') : t('pages.zoneCreate.title')}</DialogTitle>
        <DialogContent>
          {isEditMode && zoneQuery.isLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <Stack spacing={3} sx={{ pt: 1 }}>
              <RHFTextField<Values> name="name" label={t('fields.name')} />
              <RHFTextField<Values> name="sortOrder" label={t('fields.sortOrder')} type="number" />
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
