import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form, RHFCheckbox, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useCreateBranchMutation, useGetBranchByIdQuery, useUpdateBranchMutation } from '../../../application';

const schema = z.object({
  name: z.string().min(1),
  address: z.string(),
  phone: z.string(),
  serviceFeePercent: z.coerce.number().int().min(0).max(100),
  legalName: z.string(),
  taxNumber: z.string(),
  vatEnabled: z.boolean(),
  isDefault: z.boolean(),
});

type Values = z.infer<typeof schema>;

const BranchFormPage = () => {
  const { t } = useTranslate('organizations');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);
  const query = useGetBranchByIdQuery(id ?? '', { enabled: isEditMode });
  const createMutation = useCreateBranchMutation();
  const updateMutation = useUpdateBranchMutation(id ?? '');

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      serviceFeePercent: 10,
      legalName: '',
      taxNumber: '',
      vatEnabled: false,
      isDefault: false,
    },
  });

  useEffect(() => {
    if (!query.data) return;
    methods.reset({
      name: query.data.name,
      address: query.data.address,
      phone: query.data.phone,
      serviceFeePercent: query.data.serviceFeePercent,
      legalName: query.data.legalName,
      taxNumber: query.data.taxNumber,
      vatEnabled: query.data.vatEnabled,
      isDefault: query.data.isDefault,
    });
  }, [methods, query.data]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      address: values.address.trim(),
      phone: values.phone.trim(),
      serviceFeePercent: values.serviceFeePercent,
      legalName: values.legalName.trim(),
      taxNumber: values.taxNumber.trim(),
      vatEnabled: values.vatEnabled,
      isDefault: values.isDefault,
    };
    if (isEditMode && id) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    push(RoutePath.organizationBranchList);
  });

  if (isEditMode && query.isLoading) return <LoadingScreen />;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.branchEdit.title') : t('pages.branchCreate.title')}
        links={[
          { name: t('pages.branches.title'), href: RoutePath.organizationBranchList },
          { name: isEditMode ? t('pages.branchEdit.title') : t('pages.branchCreate.title') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
              <RHFTextField<Values> name="name" label={t('fields.name')} />
              <RHFTextField<Values> name="address" label={t('fields.address')} sx={{ gridColumn: { lg: '1 / -1' } }} />
              <RHFTextField<Values> name="phone" label={t('fields.phone')} />
            </Box>
            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h6">{t('sections.fiscalProfile')}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
                    {t('sections.fiscalProfileDescription')}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                    gap: 3,
                  }}>
                  <RHFTextField<Values> name="legalName" label={t('fields.legalName')} />
                  <RHFTextField<Values> name="taxNumber" label={t('fields.taxNumber')} />
                  <RHFTextField<Values> name="serviceFeePercent" type="number" label={t('fields.serviceFeePercent')} />
                  <RHFCheckbox<Values> name="vatEnabled" label={t('fields.vatEnabled')} />
                </Box>
              </Stack>
            </Card>
            <RHFSwitch<Values> name="isDefault" label={t('fields.default')} />
            <FormActions
              isSubmitting={methods.formState.isSubmitting}
              submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
              onCancel={() => push(RoutePath.organizationBranchList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default BranchFormPage;
