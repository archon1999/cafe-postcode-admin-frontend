import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RHFDatePicker, RHFMultiSelect, RHFPhoneInput, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import { sanitizePinCodeInput, type UserFormInput } from '../../../domain';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type Option = {
  label: string;
  value: string;
};

type RoleOption = {
  id: string;
  name: string;
};

type UserFormFieldsProps = {
  hallOptions: Option[];
  hasHallAccessPermission: boolean;
  showPinField: boolean;
  requiresLoginCredentials: boolean;
  isEditMode: boolean;
  isEmployeeSurface: boolean;
  isHallsLoading: boolean;
  isRolesLoading: boolean;
  roles: RoleOption[];
  selectedSalaryType: UserFormInput['salaryType'];
  t: TranslateFn;
  tCommon: TranslateFn;
};

export const UserFormFields = ({
  hallOptions,
  hasHallAccessPermission,
  showPinField,
  requiresLoginCredentials,
  isEditMode,
  isEmployeeSurface,
  isHallsLoading,
  isRolesLoading,
  roles,
  selectedSalaryType,
  t,
  tCommon,
}: UserFormFieldsProps) => (
  <>
    <Stack spacing={2}>
      <Typography variant="h6">{t('sections.account')}</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
        }}>
        <RHFTextField<UserFormInput> name="fullName" label={t('fields.fullName')} />
        <RHFPhoneInput<UserFormInput>
          name="phone"
          label={t('fields.phone')}
          defaultCountry="UZ"
          placeholder={t('fields.phonePlaceholder')}
        />

        <RHFSelect<UserFormInput>
          name="roleId"
          label={t('fields.role')}
          helperText={isRolesLoading ? tCommon('labels.loading') : undefined}>
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </RHFSelect>

        <RHFSelect<UserFormInput> name="employmentStatus" label={t('fields.employmentStatus')}>
          <MenuItem value="active">{t('status.active')}</MenuItem>
          <MenuItem value="inactive">{t('status.inactive')}</MenuItem>
          <MenuItem value="archived">{t('status.archived')}</MenuItem>
        </RHFSelect>

        {!isEmployeeSurface || requiresLoginCredentials ? (
          <Box
            sx={{
              display: 'grid',
              gridColumn: '1 / -1',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 3,
            }}>
            <RHFTextField<UserFormInput> name="username" label={t('fields.username')} />
            <RHFTextField<UserFormInput>
              name="password"
              label={t('fields.password')}
              type="password"
              helperText={
                isEmployeeSurface && requiresLoginCredentials
                  ? isEditMode
                    ? t('fields.employeePasswordEditHint')
                    : t('fields.employeePasswordCreateHint')
                  : isEditMode
                    ? t('fields.passwordEditHint')
                    : t('fields.passwordCreateHint')
              }
            />
          </Box>
        ) : null}

        {showPinField && (
          <RHFTextField<UserFormInput>
            name="pin"
            label={t('fields.pin')}
            helperText={t('fields.pinHint')}
            sanitizeValue={sanitizePinCodeInput}
            slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 } }}
          />
        )}

        <RHFDatePicker<UserFormInput>
          name="birthDate"
          label={t('fields.birthDate')}
          slotProps={{ textField: { helperText: t('fields.birthDateHint') } }}
          outputFormat="YYYY-MM-DD"
        />
      </Box>
    </Stack>

    {hasHallAccessPermission && (
      <>
        <Divider />

        <Stack spacing={2}>
          <Typography variant="h6">{t('sections.assignment')}</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 3,
            }}>
            <RHFSelect<UserFormInput>
              name="primaryHallId"
              label={t('fields.primaryHall')}
              helperText={isHallsLoading ? tCommon('labels.loading') : t('fields.primaryHallHint')}>
              <MenuItem value="">{t('labels.notSelected')}</MenuItem>
              {hallOptions.map((hall) => (
                <MenuItem key={hall.value} value={hall.value}>
                  {hall.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFMultiSelect<UserFormInput>
              name="allowedHallIds"
              label={t('fields.allowedHalls')}
              options={hallOptions}
              checkbox
              chip
              placeholder={t('labels.notSelected')}
              helperText={isHallsLoading ? tCommon('labels.loading') : t('fields.allowedHallsHint')}
            />
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <RHFSwitch<UserFormInput> name="hallSwitchPermission" label={t('fields.hallSwitchPermission')} />
          </Stack>
        </Stack>
      </>
    )}

    <Divider />

    <Stack spacing={2}>
      <Typography variant="h6">{t('sections.payroll')}</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
        }}>
        <RHFTextField<UserFormInput> name="passportSeries" label={t('fields.passportSeries')} />
        <RHFTextField<UserFormInput> name="pnfl" label={t('fields.pnfl')} />

        <RHFSelect<UserFormInput> name="salaryType" label={t('fields.salaryType')}>
          <MenuItem value="hourly">{t('salaryType.hourly')}</MenuItem>
          <MenuItem value="daily">{t('salaryType.daily')}</MenuItem>
          <MenuItem value="monthly">{t('salaryType.monthly')}</MenuItem>
        </RHFSelect>

        {selectedSalaryType && (
          <RHFTextField<UserFormInput>
            name="baseAmount"
            label={t('fields.baseAmount')}
            type="number"
            inputProps={{ min: 0, step: 1000 }}
          />
        )}

        <RHFTextField<UserFormInput>
          name="kpiPercent"
          label={t('fields.kpiPercent')}
          type="number"
          inputProps={{ min: 0, step: 1 }}
        />
      </Box>
    </Stack>
  </>
);
