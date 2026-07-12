import { zodResolver } from '@hookform/resolvers/zod';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessTariffs } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useGetRolesQuery } from 'modules/user-management/roles/application';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { usePageTitle } from 'shared/hooks/use-page-title';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useCreateTariffMutation, useGetTariffByIdQuery, useUpdateTariffMutation } from '../../../application';

import { TariffFormFields } from './TariffFormFields';

const schema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  monthlyPrice: z.union([z.number(), z.literal('')]).default(''),
  yearlyPrice: z.union([z.number(), z.literal('')]).default(''),
  isActive: z.boolean().default(true),
  allowedRoleIds: z.array(z.string()).default([]),
  permissionIds: z.array(z.string()).default([]),
});

type TariffFormValues = z.input<typeof schema>;
export type Values = z.output<typeof schema>;

const PLATFORM_ROLE_CODES = new Set(['product_owner', 'business_partner']);

function uniquePermissionIds(permissionIds: string[]) {
  return [...new Set(permissionIds)];
}

const TariffFormPage = () => {
  const { t } = useTranslate('platform');
  const { profile } = useCurrentUser();
  const { id } = useParams() as { id?: string };
  const { push, replace } = useRouter();
  const isEditMode = Boolean(id);
  const canManagePlatform = canAccessTariffs(profile);
  const query = useGetTariffByIdQuery(id ?? '', { enabled: isEditMode && canManagePlatform });
  const createMutation = useCreateTariffMutation();
  const updateMutation = useUpdateTariffMutation(id ?? '');
  const rolesQuery = useGetRolesQuery('user', { enabled: canManagePlatform });
  const listTitle = t('pages.tariffs.title');
  const editTitle = t('pages.tariffEdit.title');
  const createTitle = t('pages.tariffCreate.title');
  const entityTitle = query.data?.name;

  useRedirectOnNotFound(query.error, isEditMode);
  usePageTitle(
    isEditMode
      ? entityTitle
        ? [listTitle, entityTitle, editTitle]
        : [listTitle, editTitle]
      : [listTitle, createTitle],
  );

  const methods = useForm<TariffFormValues, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      monthlyPrice: '',
      yearlyPrice: '',
      isActive: true,
      allowedRoleIds: [],
      permissionIds: [],
    },
  });
  const previousDerivedPermissionIdsRef = useRef<string[]>([]);

  const roles = useMemo(
    () => (rolesQuery.data ?? []).filter((role) => role.isSystem && role.code && !PLATFORM_ROLE_CODES.has(role.code)),
    [rolesQuery.data],
  );

  const selectedRoleIds = methods.watch('allowedRoleIds');
  const isAllowedRoleSelectionDirty = Boolean(methods.formState.dirtyFields.allowedRoleIds);

  const derivedPermissionIds = useMemo(() => {
    const permissionIds = new Set<string>();
    for (const role of roles) {
      if (!selectedRoleIds.includes(role.id)) {
        continue;
      }
      for (const permission of role.permissions) {
        permissionIds.add(permission.id);
      }
    }
    return [...permissionIds];
  }, [roles, selectedRoleIds]);

  useEffect(() => {
    if (profile && !canManagePlatform) {
      replace(RoutePath.main);
    }
  }, [canManagePlatform, profile, replace]);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    methods.reset({
      name: query.data.name,
      description: query.data.description,
      monthlyPrice: Number(query.data.monthlyPrice),
      yearlyPrice: Number(query.data.yearlyPrice),
      isActive: query.data.isActive,
      allowedRoleIds: query.data.allowedRoles.map((role) => role.id),
      permissionIds: query.data.permissions.map((permission) => permission.id),
    });
  }, [methods, query.data]);

  useEffect(() => {
    if (!isAllowedRoleSelectionDirty) {
      previousDerivedPermissionIdsRef.current = derivedPermissionIds;
      return;
    }

    const previousDerivedPermissionIds = previousDerivedPermissionIdsRef.current;
    const newlyDerivedPermissionIds = derivedPermissionIds.filter(
      (permissionId) => !previousDerivedPermissionIds.includes(permissionId),
    );

    previousDerivedPermissionIdsRef.current = derivedPermissionIds;

    if (newlyDerivedPermissionIds.length === 0) {
      return;
    }

    const currentPermissionIds = methods.getValues('permissionIds');
    methods.setValue('permissionIds', uniquePermissionIds([...currentPermissionIds, ...newlyDerivedPermissionIds]), {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [derivedPermissionIds, isAllowedRoleSelectionDirty, methods]);

  const onSubmit = methods.handleSubmit(async (values: Values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      monthlyPrice: values.monthlyPrice === '' ? 0 : values.monthlyPrice,
      yearlyPrice: values.yearlyPrice === '' ? 0 : values.yearlyPrice,
      isActive: values.isActive,
      allowedRoleIds: values.allowedRoleIds,
      permissionIds: uniquePermissionIds(values.permissionIds),
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
        heading={isEditMode ? editTitle : createTitle}
        action={isEditMode ? <BackToListButton href={RoutePath.platformTariffList} /> : undefined}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <TariffFormFields
              canManagePlatform={canManagePlatform}
              derivedPermissionCount={derivedPermissionIds.length}
              roleOptions={roles}
              t={t}
            />
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
