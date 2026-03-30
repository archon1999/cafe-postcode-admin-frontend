import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import { Form, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useCreateHallMutation, useGetHallByIdQuery, useUpdateHallMutation } from '../../../application';

const schema = z.object({
  name: z.string().min(1),
  description: z.string(),
  sortOrder: z.coerce.number().min(0),
  isActive: z.boolean(),
});

type Values = z.infer<typeof schema>;

const HallFormPage = () => {
  const { t } = useTranslate('floor');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);
  const query = useGetHallByIdQuery(id ?? '', { enabled: isEditMode });
  const createMutation = useCreateHallMutation();
  const updateMutation = useUpdateHallMutation(id ?? '');

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', sortOrder: 0, isActive: true },
  });

  useEffect(() => {
    if (!query.data) return;
    methods.reset({
      name: query.data.name,
      description: query.data.description ?? '',
      sortOrder: query.data.sortOrder ?? 0,
      isActive: query.data.isActive,
    });
  }, [methods, query.data]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    if (isEditMode && id) await updateMutation.mutateAsync(payload);
    else await createMutation.mutateAsync(payload);

    push(RoutePath.floorHallList);
  });

  if (isEditMode && query.isLoading) return <LoadingScreen />;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.hallEdit.title') : t('pages.hallCreate.title')}
        links={[
          { name: t('pages.halls.title'), href: RoutePath.floorHallList },
          { name: isEditMode ? t('pages.hallEdit.title') : t('pages.hallCreate.title') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
              <RHFTextField<Values> name="name" label={t('fields.name')} />
              <RHFTextField<Values> name="sortOrder" label={t('fields.sortOrder')} type="number" />
              <RHFTextField<Values>
                name="description"
                label={t('fields.description')}
                multiline
                rows={3}
                sx={{ gridColumn: { lg: '1 / -1' } }}
              />
            </Box>
            <RHFSwitch<Values> name="isActive" label={t('fields.status')} />
            <FormActions
              isSubmitting={methods.formState.isSubmitting}
              submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
              onCancel={() => push(RoutePath.floorHallList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default HallFormPage;
