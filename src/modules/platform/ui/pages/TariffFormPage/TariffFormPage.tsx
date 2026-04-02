import { zodResolver } from '@hookform/resolvers/zod';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessTariffs } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useGetRolesQuery } from 'modules/users/application';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useCreateTariffMutation, useGetTariffByIdQuery, useUpdateTariffMutation } from '../../../application';

import { TariffFormFields } from './TariffFormFields';

const schema = z.object({
  name: z.string().min(1),
  classification: z.enum(['basic', 'standard', 'premium', 'custom']),
  description: z.string().default(''),
  monthlyPrice: z.union([z.number(), z.literal('')]).default(''),
  yearlyPrice: z.union([z.number(), z.literal('')]).default(''),
  isActive: z.boolean().default(true),
  permissionIds: z.array(z.string()).default([]),
  allowedRoleIds: z.array(z.string()).default([]),
  operationalSettingsText: z.string().default(''),
});

export type Values = z.infer<typeof schema>;

const TariffFormPage = () => {
  const { t } = useTranslate('platform');
  const { profile } = useCurrentUser();
  const { id } = useParams<{ id: string }>();
  const { push, replace } = useRouter();
  const isEditMode = Boolean(id);
  const canManagePlatform = canAccessTariffs(profile);
  const query = useGetTariffByIdQuery(id ?? '', { enabled: isEditMode && canManagePlatform });
  const createMutation = useCreateTariffMutation();
  const updateMutation = useUpdateTariffMutation(id ?? '');
  const rolesQuery = useGetRolesQuery({ enabled: canManagePlatform });

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      classification: 'basic',
      description: '',
      monthlyPrice: '',
      yearlyPrice: '',
      isActive: true,
      permissionIds: [],
      allowedRoleIds: [],
      operationalSettingsText: '',
    },
  });

  useEffect(() => {
    if (profile && !canManagePlatform) {
      replace(RoutePath.main);
    }
  }, [canManagePlatform, profile, replace]);

  useEffect(() => {
    if (!query.data) return;

    methods.reset({
      name: query.data.name,
      classification: query.data.classification,
      description: query.data.description,
      monthlyPrice: Number(query.data.monthlyPrice),
      yearlyPrice: Number(query.data.yearlyPrice),
      isActive: query.data.isActive,
      permissionIds: query.data.permissions.map((permission) => permission.id),
      allowedRoleIds: query.data.allowedRoles.map((role) => role.id),
      operationalSettingsText: JSON.stringify(query.data.operationalSettings ?? {}, null, 2),
    });
  }, [methods, query.data]);

  const roleOptions = useMemo(
    () =>
      (rolesQuery.data ?? [])
        .filter((role) => role.isSystem)
        .map((role) => ({
          value: role.id,
          label: role.name,
        })),
    [rolesQuery.data],
  );

  const onSubmit = methods.handleSubmit(async (values) => {
    let operationalSettings: Record<string, unknown> = {};

    if (values.operationalSettingsText.trim()) {
      try {
        operationalSettings = JSON.parse(values.operationalSettingsText) as Record<string, unknown>;
      } catch {
        methods.setError('operationalSettingsText', {
          type: 'validate',
          message: t('validation.invalidJson'),
        });
        return;
      }
    }

    const payload = {
      name: values.name.trim(),
      classification: values.classification,
      description: values.description.trim(),
      monthlyPrice: values.monthlyPrice === '' ? 0 : values.monthlyPrice,
      yearlyPrice: values.yearlyPrice === '' ? 0 : values.yearlyPrice,
      isActive: values.isActive,
      permissionIds: values.permissionIds,
      allowedRoleIds: values.allowedRoleIds,
      operationalSettings,
    };

    if (isEditMode && id) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    push(RoutePath.platformTariffList);
  });

  if ((isEditMode && query.isLoading) || (profile && !canManagePlatform)) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.tariffEdit.title') : t('pages.tariffCreate.title')}
        links={[
          { name: t('pages.tariffs.title'), href: RoutePath.platformTariffList },
          { name: isEditMode ? t('pages.tariffEdit.title') : t('pages.tariffCreate.title') },
        ]}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <TariffFormFields canManagePlatform={canManagePlatform} roleOptions={roleOptions} t={t} />
            <FormActions
              isSubmitting={methods.formState.isSubmitting}
              submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
              onCancel={() => push(RoutePath.platformTariffList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default TariffFormPage;

