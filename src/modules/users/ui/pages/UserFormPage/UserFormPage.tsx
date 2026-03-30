import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import { useParams, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import {
  Form,
  RHFDatePicker,
  RHFMultiSelect,
  RHFPhoneInput,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
} from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { getAdminRoleLabel } from 'shared/utils/admin-role';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import {
  useCreateUserMutation,
  useGetHallsQuery,
  useGetRolesQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from '../../../application';
import {
  buildUserPayload,
  defaultUserFormValues,
  mapUserToFormValues,
  userFormSchema,
  type UserFormValues,
} from '../../../domain';

const UserFormPage = () => {
  const { t } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);

  const rolesQuery = useGetRolesQuery();
  const hallsQuery = useGetHallsQuery();
  const userQuery = useGetUserByIdQuery(id ?? '', { enabled: isEditMode });
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation(id ?? '');

  const methods = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: defaultUserFormValues,
  });

  const { handleSubmit, reset, watch, setValue, formState } = methods;
  const selectedRoleId = watch('roleId');
  const selectedSalaryType = watch('salaryType');
  const selectedEmploymentStatus = watch('employmentStatus');
  const selectedIsActive = watch('isActive');
  const selectedPrimaryHallId = watch('primaryHallId');
  const selectedAllowedHallIds = watch('allowedHallIds');
  const roles = Array.isArray(rolesQuery.data) ? rolesQuery.data : [];
  const halls = Array.isArray(hallsQuery.data) ? hallsQuery.data : [];
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const hasPosAccessPermission = Boolean(selectedRole?.permissions.some((permission) => permission.scope === 'pos'));
  const hasHallAccessPermission = Boolean(
    selectedRole?.permissions.some((permission) =>
      ['hall.view', 'hall.manage', 'table.manage'].includes(permission.code),
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
    if (selectedEmploymentStatus !== 'archived') {
      setValue('employmentStatus', selectedIsActive ? 'active' : 'inactive');
    }
  }, [selectedIsActive, selectedEmploymentStatus, setValue]);

  useEffect(() => {
    if (selectedSalaryType !== 'kpi') {
      setValue('kpiPercent', null);
    }

    if (selectedSalaryType !== 'hourly' && selectedSalaryType !== 'daily') {
      setValue('baseAmount', null);
    }
  }, [selectedSalaryType, setValue]);

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
    if (!hasPosAccessPermission) {
      setValue('pin', '');
    }
  }, [hasPosAccessPermission, setValue]);

  const hallOptions = halls.map((hall) => ({
    value: hall.id,
    label: formatHallDisplayName(hall.name, undefined, tCommon),
  }));

  const onSubmit = handleSubmit(async (values) => {
    const payload = buildUserPayload(values);

    if (!hasHallAccessPermission) {
      payload.primaryHallId = null;
      payload.allowedHallIds = [];
      payload.hallSwitchPermission = false;
    }

    if (!hasPosAccessPermission) {
      delete payload.pin;
    }

    if (isEditMode && id) {
      const updatedUser = await updateUserMutation.mutateAsync(payload);
      push(RouterPathHelper.userView(updatedUser.id));
      return;
    }

    const createdUser = await createUserMutation.mutateAsync(payload);
    push(RouterPathHelper.userView(createdUser.id));
  });

  if (isEditMode && userQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.edit.title') : t('pages.create.title')}
        links={[
          { name: t('pages.list.title'), href: RoutePath.userList },
          { name: isEditMode ? t('pages.edit.title') : t('pages.create.title') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={4}>
            <Stack spacing={2}>
              <Typography variant="h6">{t('sections.account')}</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 3,
                }}>
                <RHFTextField<UserFormValues> name="username" label={t('fields.username')} />
                <RHFTextField<UserFormValues> name="fullName" label={t('fields.fullName')} />
                <RHFPhoneInput<UserFormValues>
                  name="phone"
                  label={t('fields.phone')}
                  defaultCountry="UZ"
                  placeholder={t('fields.phonePlaceholder')}
                />

                <RHFSelect<UserFormValues>
                  name="roleId"
                  label={t('fields.role')}
                  helperText={rolesQuery.isLoading ? tCommon('labels.loading') : undefined}>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {getAdminRoleLabel(role, t) ?? role.name}
                    </MenuItem>
                  ))}
                </RHFSelect>

                <RHFTextField<UserFormValues>
                  name="password"
                  label={t('fields.password')}
                  type="password"
                  helperText={isEditMode ? t('fields.passwordEditHint') : t('fields.passwordCreateHint')}
                />

                {hasPosAccessPermission && (
                  <RHFTextField<UserFormValues>
                    name="pin"
                    label={t('fields.pin')}
                    helperText={t('fields.pinHint')}
                    inputProps={{ inputMode: 'numeric', maxLength: 4 }}
                  />
                )}
              </Box>
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Typography variant="h6">{t('sections.assignment')}</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 3,
                }}>
                <RHFSelect<UserFormValues> name="employmentStatus" label={t('fields.employmentStatus')}>
                  <MenuItem value="active">{t('status.active')}</MenuItem>
                  <MenuItem value="inactive">{t('status.inactive')}</MenuItem>
                  <MenuItem value="archived">{t('status.archived')}</MenuItem>
                </RHFSelect>

                {hasHallAccessPermission && (
                  <>
                    <RHFSelect<UserFormValues>
                      name="primaryHallId"
                      label={t('fields.primaryHall')}
                      helperText={hallsQuery.isLoading ? tCommon('labels.loading') : t('fields.primaryHallHint')}>
                      <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                      {halls.map((hall) => (
                        <MenuItem key={hall.id} value={hall.id}>
                          {formatHallDisplayName(hall.name, undefined, tCommon)}
                        </MenuItem>
                      ))}
                    </RHFSelect>

                    <RHFMultiSelect<UserFormValues>
                      name="allowedHallIds"
                      label={t('fields.allowedHalls')}
                      options={hallOptions}
                      checkbox
                      chip
                      placeholder={t('labels.notSelected')}
                      helperText={hallsQuery.isLoading ? tCommon('labels.loading') : t('fields.allowedHallsHint')}
                    />
                  </>
                )}

                <RHFDatePicker<UserFormValues>
                  name="birthDate"
                  label={t('fields.birthDate')}
                  slotProps={{ textField: { helperText: t('fields.birthDateHint') } }}
                  outputFormat="YYYY-MM-DD"
                />
              </Box>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <RHFSwitch<UserFormValues>
                  name="isActive"
                  label={t('fields.statusToggle')}
                  disabled={selectedEmploymentStatus === 'archived'}
                />
                {hasHallAccessPermission && (
                  <RHFSwitch<UserFormValues> name="hallSwitchPermission" label={t('fields.hallSwitchPermission')} />
                )}
              </Stack>
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Typography variant="h6">{t('sections.payroll')}</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 3,
                }}>
                <RHFTextField<UserFormValues> name="passportSeries" label={t('fields.passportSeries')} />
                <RHFTextField<UserFormValues> name="pnfl" label={t('fields.pnfl')} />

                <RHFSelect<UserFormValues> name="salaryType" label={t('fields.salaryType')}>
                  <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                  <MenuItem value="hourly">{t('salaryType.hourly')}</MenuItem>
                  <MenuItem value="daily">{t('salaryType.daily')}</MenuItem>
                  <MenuItem value="kpi">{t('salaryType.kpi')}</MenuItem>
                </RHFSelect>

                {(selectedSalaryType === 'hourly' || selectedSalaryType === 'daily') && (
                  <RHFTextField<UserFormValues>
                    name="baseAmount"
                    label={t('fields.baseAmount')}
                    type="number"
                    inputProps={{ min: 0, step: 1000 }}
                  />
                )}

                {selectedSalaryType === 'kpi' && (
                  <RHFTextField<UserFormValues>
                    name="kpiPercent"
                    label={t('fields.kpiPercent')}
                    type="number"
                    inputProps={{ min: 0, max: 100, step: 1 }}
                  />
                )}
              </Box>
            </Stack>

            <FormActions
              isSubmitting={formState.isSubmitting}
              submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
              onCancel={() => push(isEditMode && id ? RouterPathHelper.userView(id) : RoutePath.userList)}
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

export default UserFormPage;
