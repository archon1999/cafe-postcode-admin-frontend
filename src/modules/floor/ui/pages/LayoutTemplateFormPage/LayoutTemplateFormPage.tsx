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

import {
  useCreateLayoutTemplateMutation,
  useGetLayoutTemplateByIdQuery,
  useUpdateLayoutTemplateMutation,
} from '../../../application';

const schema = z.object({
  name: z.string().min(1),
  description: z.string(),
  payloadJson: z.string(),
  isDefault: z.boolean(),
});

type Values = z.infer<typeof schema>;

const LayoutTemplateFormPage = () => {
  const { t } = useTranslate('floor');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);
  const query = useGetLayoutTemplateByIdQuery(id ?? '', { enabled: isEditMode });
  const createMutation = useCreateLayoutTemplateMutation();
  const updateMutation = useUpdateLayoutTemplateMutation(id ?? '');

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', payloadJson: '{}', isDefault: false },
  });

  useEffect(() => {
    if (!query.data) return;
    methods.reset({
      name: query.data.name,
      description: query.data.description ?? '',
      payloadJson: JSON.stringify(query.data.payload ?? {}, null, 2),
      isDefault: query.data.isDefault,
    });
  }, [methods, query.data]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      payload: values.payloadJson.trim() ? (JSON.parse(values.payloadJson) as Record<string, unknown>) : {},
      isDefault: values.isDefault,
    };
    if (isEditMode && id) await updateMutation.mutateAsync(payload);
    else await createMutation.mutateAsync(payload);
    push(RoutePath.floorLayoutTemplateList);
  });

  if (isEditMode && query.isLoading) return <LoadingScreen />;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.layoutTemplateEdit.title') : t('pages.layoutTemplateCreate.title')}
        links={[
          { name: t('pages.layoutTemplates.title'), href: RoutePath.floorLayoutTemplateList },
          { name: isEditMode ? t('pages.layoutTemplateEdit.title') : t('pages.layoutTemplateCreate.title') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
              <RHFTextField<Values> name="name" label={t('fields.name')} />
              <RHFTextField<Values> name="description" label={t('fields.description')} multiline rows={3} />
              <RHFTextField<Values> name="payloadJson" label={t('fields.payload')} multiline rows={8} />
            </Box>
            <RHFSwitch<Values> name="isDefault" label={t('fields.default')} />
            <FormActions
              isSubmitting={methods.formState.isSubmitting}
              submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
              onCancel={() => push(RoutePath.floorLayoutTemplateList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default LayoutTemplateFormPage;
