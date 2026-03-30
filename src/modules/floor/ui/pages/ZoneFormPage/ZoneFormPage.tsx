import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import {
  useCreateZoneMutation,
  useGetFloorHallsQuery,
  useGetZoneByIdQuery,
  useUpdateZoneMutation,
} from '../../../application';

const schema = z.object({
  hall: z.string().min(1),
  name: z.string().min(1),
  isPrivate: z.boolean(),
  sortOrder: z.coerce.number().min(0),
  isActive: z.boolean(),
});

type Values = z.infer<typeof schema>;

const ZoneFormPage = () => {
  const { t } = useTranslate('floor');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);
  const query = useGetZoneByIdQuery(id ?? '', { enabled: isEditMode });
  const hallsQuery = useGetFloorHallsQuery();
  const createMutation = useCreateZoneMutation();
  const updateMutation = useUpdateZoneMutation(id ?? '');

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { hall: '', name: '', isPrivate: false, sortOrder: 0, isActive: true },
  });

  useEffect(() => {
    if (!query.data) return;
    methods.reset({
      hall: query.data.hall,
      name: query.data.name,
      isPrivate: query.data.isPrivate,
      sortOrder: query.data.sortOrder,
      isActive: query.data.isActive,
    });
  }, [methods, query.data]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      hall: values.hall,
      name: values.name.trim(),
      isPrivate: values.isPrivate,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };
    if (isEditMode && id) await updateMutation.mutateAsync(payload);
    else await createMutation.mutateAsync(payload);
    push(RoutePath.floorZoneList);
  });

  if (isEditMode && query.isLoading) return <LoadingScreen />;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.zoneEdit.title') : t('pages.zoneCreate.title')}
        links={[
          { name: t('pages.zones.title'), href: RoutePath.floorZoneList },
          { name: isEditMode ? t('pages.zoneEdit.title') : t('pages.zoneCreate.title') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
              <RHFSelect<Values>
                name="hall"
                label={t('fields.hall')}
                helperText={hallsQuery.isLoading ? tCommon('labels.loading') : undefined}>
                {(hallsQuery.data ?? []).map((hall) => (
                  <MenuItem key={hall.id} value={hall.id}>
                    {formatHallDisplayName(hall.name, hall.level, tCommon)}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField<Values> name="name" label={t('fields.name')} />
              <RHFTextField<Values> name="sortOrder" label={t('fields.sortOrder')} type="number" />
            </Box>
            <Stack spacing={2}>
              <RHFSwitch<Values> name="isPrivate" label={t('fields.isPrivate')} />
              <RHFSwitch<Values> name="isActive" label={t('fields.status')} />
            </Stack>
            <FormActions
              isSubmitting={methods.formState.isSubmitting}
              submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
              onCancel={() => push(RoutePath.floorZoneList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default ZoneFormPage;
