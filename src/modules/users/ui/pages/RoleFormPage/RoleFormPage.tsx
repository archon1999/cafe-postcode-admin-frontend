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
import { Form, RHFMultiSelect, RHFTextField } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { getAdminPermissionLabel } from 'shared/utils/admin-permission';

import {
  useCreateRoleMutation,
  useGetPermissionsQuery,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
} from '../../../application';

const roleFormSchema = z.object({
  code: z.string().min(1, { message: 'Kod talab qilinadi' }),
  name: z.string().min(1, { message: 'Nomi talab qilinadi' }),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

const defaultValues: RoleFormValues = {
  code: '',
  name: '',
  description: '',
  permissionIds: [],
};

const RoleFormPage = () => {
  const { t } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);

  const permissionsQuery = useGetPermissionsQuery();
  const roleQuery = useGetRoleByIdQuery(id ?? '', { enabled: isEditMode });
  const createRoleMutation = useCreateRoleMutation();
  const updateRoleMutation = useUpdateRoleMutation(id ?? '');

  useRedirectOnNotFound(roleQuery.error, isEditMode);

  const methods = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (!roleQuery.data) return;

    reset({
      code: roleQuery.data.code,
      name: roleQuery.data.name,
      description: roleQuery.data.description ?? '',
      permissionIds: roleQuery.data.permissions.map((permission) => permission.id),
    });
  }, [reset, roleQuery.data]);

  const permissionOptions = (permissionsQuery.data ?? []).map((permission) => ({
    value: permission.id,
    label: getAdminPermissionLabel(permission, t),
  }));

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() ?? '',
      permissionIds: values.permissionIds,
    };

    if (isEditMode && id) {
      await updateRoleMutation.mutateAsync(payload);
    } else {
      await createRoleMutation.mutateAsync(payload);
    }

    push(RoutePath.roleList);
  });

  if (isEditMode && roleQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={
          isEditMode
            ? t('pages.roleEdit.title', { defaultValue: 'Rolni tahrirlash' })
            : t('pages.roleCreate.title', { defaultValue: 'Yangi rol' })
        }
        links={[
          { name: t('pages.roles.title'), href: RoutePath.roleList },
          {
            name: isEditMode
              ? t('pages.roleEdit.title', { defaultValue: 'Rolni tahrirlash' })
              : t('pages.roleCreate.title', { defaultValue: 'Yangi rol' }),
          },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 3,
              }}>
              <RHFTextField<RoleFormValues> name="code" label={t('fields.code')} />
              <RHFTextField<RoleFormValues> name="name" label={t('fields.name')} />
              <RHFTextField<RoleFormValues> name="description" label={t('fields.description')} multiline rows={4} />
              <RHFMultiSelect<RoleFormValues>
                name="permissionIds"
                label={t('fields.permissions')}
                options={permissionOptions}
                checkbox
                chip
                placeholder={t('labels.notSelected')}
                helperText={permissionsQuery.isLoading ? tCommon('labels.loading') : undefined}
              />
            </Box>

            <FormActions
              isSubmitting={formState.isSubmitting}
              submitLabel={
                isEditMode ? t('actions.save') : t('actions.roleCreateSubmit', { defaultValue: 'Rolni saqlash' })
              }
              onCancel={() => push(RoutePath.roleList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default RoleFormPage;
