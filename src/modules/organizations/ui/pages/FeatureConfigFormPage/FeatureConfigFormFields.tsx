import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';

import { RHFMultiSelect, RHFSelect, RHFSwitch } from 'shared/ui/HookForm';

import { getFeatureKitchenModeTranslationKey, getFeatureOrderEntryModeTranslationKey } from '../../lib/presenters';

import type { Values } from './FeatureConfigFormPage';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type FeatureConfigFormFieldsProps = {
  availableRoleOptions: readonly string[];
  cashierEnabled: boolean;
  enabledRolesHelperText?: string;
  hallEnabled: boolean;
  kitchenEnabled: boolean;
  kitchenModeHelperText?: string;
  kitchenModes: readonly Values['kitchenMode'][];
  orderEntryModeHelperText?: string;
  orderEntryModes: readonly Values['orderEntryMode'][];
  ownerDashboardEnabled: boolean;
  rolesByCode: Map<string, string>;
  t: TranslateFn;
};

export const FeatureConfigFormFields = ({
  availableRoleOptions,
  cashierEnabled,
  enabledRolesHelperText,
  hallEnabled,
  kitchenEnabled,
  kitchenModeHelperText,
  kitchenModes,
  orderEntryModeHelperText,
  orderEntryModes,
  ownerDashboardEnabled,
  rolesByCode,
  t,
}: FeatureConfigFormFieldsProps) => (
  <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
      <RHFSelect<Values> name="orderEntryMode" label={t('fields.orderEntryMode')} helperText={orderEntryModeHelperText}>
        {orderEntryModes.map((mode) => (
          <MenuItem
            key={mode}
            value={mode}
            disabled={(mode === 'hall' && !hallEnabled) || (mode === 'cashier_builder' && !cashierEnabled)}>
            {t(getFeatureOrderEntryModeTranslationKey(mode))}
          </MenuItem>
        ))}
      </RHFSelect>
      <RHFSelect<Values>
        name="kitchenMode"
        label={t('fields.kitchenMode')}
        disabled={!kitchenEnabled}
        helperText={kitchenModeHelperText}>
        {kitchenModes.map((mode) => (
          <MenuItem key={mode} value={mode}>
            {t(getFeatureKitchenModeTranslationKey(mode))}
          </MenuItem>
        ))}
      </RHFSelect>
      <RHFMultiSelect<Values>
        name="enabledRoles"
        label={t('fields.enabledRoles')}
        chip
        checkbox
        helperText={enabledRolesHelperText}
        options={availableRoleOptions.map((role) => ({
          value: role,
          label: rolesByCode.get(role) ?? role,
        }))}
        sx={{ gridColumn: { lg: '1 / -1' } }}
      />
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
      <RHFSwitch<Values>
        name="hallEnabled"
        label={t('fields.hallEnabled')}
        helperText={
          !cashierEnabled
            ? t('helpers.hallRequired', {
                defaultValue: "Kassa o'chirilganida zallar moduli yoqilgan bo'lishi kerak.",
              })
            : undefined
        }
        slotProps={{ switch: { disabled: !cashierEnabled && hallEnabled } }}
      />
      <RHFSwitch<Values>
        name="kitchenEnabled"
        label={t('fields.kitchenEnabled')}
        helperText={
          !kitchenEnabled
            ? t('helpers.kitchenDisabled', {
                defaultValue: "Oshxona o'chirilsa kitchen mode va oshpaz rollari avtomatik cheklanadi.",
              })
            : undefined
        }
      />
      <RHFSwitch<Values>
        name="cashierEnabled"
        label={t('fields.cashierEnabled')}
        helperText={
          !hallEnabled
            ? t('helpers.cashierRequired', {
                defaultValue: "Zallar o'chirilganida kassa moduli yoqilgan bo'lishi kerak.",
              })
            : undefined
        }
        slotProps={{ switch: { disabled: !hallEnabled && cashierEnabled } }}
      />
      <RHFSwitch<Values>
        name="ownerDashboardEnabled"
        label={t('fields.ownerDashboardEnabled')}
        helperText={
          ownerDashboardEnabled
            ? t('helpers.ownerDashboardEnabled', {
                defaultValue: 'Rahbar paneli owner uchun alohida loyiha sifatida keyin ulanadi.',
              })
            : undefined
        }
      />
    </Box>
  </>
);
