import { zodResolver } from '@hookform/resolvers/zod';
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
import { Form } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useCreateBranchMutation, useGetBranchByIdQuery, useUpdateBranchMutation } from '../../../application';

import { BranchFormFields } from './BranchFormFields';

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

export type Values = z.infer<typeof schema>;

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
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <BranchFormFields t={t} />
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

