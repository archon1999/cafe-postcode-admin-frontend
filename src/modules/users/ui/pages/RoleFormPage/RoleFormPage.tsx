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

import { useCreateRoleMutation, useGetRoleByIdQuery, useUpdateRoleMutation } from '../../../application';

import { RoleFormFields } from './RoleFormFields';

const roleFormSchema = z.object({
  name: z.string().min(1, { message: 'Nomi talab qilinadi' }),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

const defaultValues: RoleFormValues = {
  name: '',
  description: '',
  permissionIds: [],
};

const RoleFormPage = () => {
  const { t } = useTranslate('users');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);

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
      name: roleQuery.data.name,
      description: roleQuery.data.description ?? '',
      permissionIds: roleQuery.data.permissions.map((permission) => permission.id),
    });
  }, [reset, roleQuery.data]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
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
      />

      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <RoleFormFields t={t} />

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
