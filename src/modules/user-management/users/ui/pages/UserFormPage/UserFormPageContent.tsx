import { zodResolver } from '@hookform/resolvers/zod';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import {
  useCreateUserMutation,
  useCreateEmployeeMutation,
  useGetHallsQuery,
  useGetRolesQuery,
  useGetEmployeeByIdQuery,
  useGetUserByIdQuery,
  useUpdateEmployeeMutation,
  useUpdateUserMutation,
} from '../../../application';
import {
  buildUserPayload,
  defaultUserFormValues,
  getUserFormSchema,
  mapUserToFormValues,
  type UserManagementSurface,
  type UserFormValues,
} from '../../../domain';

import { UserFormFields } from './UserFormFields';

export type UserFormPageContentProps = {
  id?: string;
  surface?: UserManagementSurface;
};

export const UserFormPageContent = ({ id, surface = 'user' }: UserFormPageContentProps) => {
  const { t } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const { push } = useRouter();
  const isEditMode = Boolean(id);
  const isEmployeeSurface = surface === 'employee';
  const formSchema = useMemo(() => getUserFormSchema(surface), [surface]);
  const listPath = isEmployeeSurface ? RoutePath.employeeList : RoutePath.userList;

  const rolesQuery = useGetRolesQuery(surface);
  const hallsQuery = useGetHallsQuery();
  const systemUserQuery = useGetUserByIdQuery(id ?? '', { enabled: isEditMode && !isEmployeeSurface });
  const employeeUserQuery = useGetEmployeeByIdQuery(id ?? '', { enabled: isEditMode && isEmployeeSurface });
  const userQuery = isEmployeeSurface ? employeeUserQuery : systemUserQuery;
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation(id ?? '');
  const createEmployeeMutation = useCreateEmployeeMutation();
  const updateEmployeeMutation = useUpdateEmployeeMutation(id ?? '');

  const methods = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultUserFormValues,
  });

  const { handleSubmit, reset, watch, setValue, formState } = methods;
  const selectedRoleId = watch('roleId');
  const selectedSalaryType = watch('salaryType');
  const baseAmount = watch('baseAmount');
  const selectedEmploymentStatus = watch('employmentStatus');
  const selectedPrimaryHallId = watch('primaryHallId');
  const selectedAllowedHallIds = watch('allowedHallIds');
  const roles = Array.isArray(rolesQuery.data) ? rolesQuery.data : [];
  const halls = Array.isArray(hallsQuery.data) ? hallsQuery.data : [];
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const hasPosAccessPermission = Boolean(selectedRole?.permissions.some((permission) => permission.scope === 'pos'));
  const showPinField = isEmployeeSurface || hasPosAccessPermission;
  const hasHallAccessPermission = Boolean(
    selectedRole?.permissions.some((permission) =>
      ['pos_halls.view', 'pos_tables.manage', 'pos_table_menu.view', 'pos_table_reservations.manage'].includes(
        permission.code,
      ),
    ),
  );

  useEffect(() => {
    if (userQuery.data) {
      reset(mapUserToFormValues(userQuery.data));
    }
  }, [reset, userQuery.data]);

  useEffect(() => {
    if (selectedEmploymentStatus === 'archived') {
      setValue('isActive', false);
      return;
    }

    setValue('isActive', selectedEmploymentStatus === 'active');
  }, [selectedEmploymentStatus, setValue]);

  useEffect(() => {
    if (selectedSalaryType && (baseAmount === null || baseAmount === undefined || Number.isNaN(baseAmount))) {
      setValue('baseAmount', 0);
    }
  }, [baseAmount, selectedSalaryType, setValue]);

  useEffect(() => {
    if (selectedPrimaryHallId && !selectedAllowedHallIds.includes(selectedPrimaryHallId)) {
      setValue('allowedHallIds', [...selectedAllowedHallIds, selectedPrimaryHallId]);
    }
  }, [selectedAllowedHallIds, selectedPrimaryHallId, setValue]);

  useEffect(() => {
    if (!hasHallAccessPermission) {
      setValue('primaryHallId', '');
      setValue('allowedHallIds', []);
      setValue('hallSwitchPermission', false);
    }
  }, [hasHallAccessPermission, setValue]);

  useEffect(() => {
    if (!showPinField) {
      setValue('pin', '');
    }
  }, [setValue, showPinField]);

  const hallOptions = halls.map((hall) => ({
    value: hall.id,
    label: formatHallDisplayName(hall.name, undefined, tCommon),
  }));

  const onSubmit = handleSubmit(async (values) => {
    const payload = buildUserPayload(values, surface);

    if (!hasHallAccessPermission) {
      payload.primaryHallId = null;
      payload.allowedHallIds = [];
      payload.hallSwitchPermission = false;
    }

    if (!showPinField) {
      delete payload.pin;
    }

    if (isEditMode && id) {
      const updatedUser = isEmployeeSurface
        ? await updateEmployeeMutation.mutateAsync(payload)
        : await updateUserMutation.mutateAsync(payload);
      push(
        isEmployeeSurface ? RouterPathHelper.employeeView(updatedUser.id) : RouterPathHelper.userView(updatedUser.id),
      );
      return;
    }

    const createdUser = isEmployeeSurface
      ? await createEmployeeMutation.mutateAsync(payload)
      : await createUserMutation.mutateAsync(payload);
    push(isEmployeeSurface ? RouterPathHelper.employeeView(createdUser.id) : RouterPathHelper.userView(createdUser.id));
  });

  if (isEditMode && userQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={
          isEmployeeSurface
            ? isEditMode
              ? t('pages.employeeEdit.title')
              : t('pages.employeeCreate.title')
            : isEditMode
              ? t('pages.edit.title')
              : t('pages.create.title')
        }
        links={[
          { name: isEmployeeSurface ? t('pages.employeeList.title') : t('pages.list.title'), href: listPath },
          {
            name: isEmployeeSurface
              ? isEditMode
                ? t('pages.employeeEdit.title')
                : t('pages.employeeCreate.title')
              : isEditMode
                ? t('pages.edit.title')
                : t('pages.create.title'),
          },
        ]}
      />

      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={4}>
            <UserFormFields
              hallOptions={hallOptions}
              hasHallAccessPermission={hasHallAccessPermission}
              showPinField={showPinField}
              isEditMode={isEditMode}
              isEmployeeSurface={isEmployeeSurface}
              isHallsLoading={hallsQuery.isLoading}
              isRolesLoading={rolesQuery.isLoading}
              roles={roles}
              selectedSalaryType={selectedSalaryType}
              t={t}
              tCommon={tCommon}
            />

            <FormActions
              isSubmitting={formState.isSubmitting}
              submitLabel={
                isEditMode ? t('actions.save') : isEmployeeSurface ? t('actions.createEmployee') : t('actions.create')
              }
              onCancel={() =>
                push(
                  isEditMode && id
                    ? isEmployeeSurface
                      ? RouterPathHelper.employeeView(id)
                      : RouterPathHelper.userView(id)
                    : listPath,
                )
              }
              disableSubmit={rolesQuery.isLoading || roles.length === 0}
            />
          </Stack>
        </Form>
      </Card>

      {roles.length === 0 && !rolesQuery.isLoading && (
        <Typography variant="body2" sx={{ color: 'warning.main', mt: 2 }}>
          {tCommon('messages.rolesRequired')}
        </Typography>
      )}
    </Content>
  );
};
