import { FormControlLabel, MenuItem, Stack, Switch, TextField } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';

import { useInventoryAccess, useInventoryCommands } from '../../../../application';
import { isDecimal, type ReferenceKind, type StockItem, type Supplier, type Warehouse } from '../../../../domain';
import { FormDialog, inventoryError, inventoryInputValue } from '../../../shared';

type Props = { kind: ReferenceKind; initial?: Warehouse | StockItem | Supplier; onClose: () => void };
export function ReferenceDialog({ kind, initial, onClose }: Props) {
  const { t } = useTranslate('inventory');
  const { canViewCost } = useInventoryAccess();
  const { saveReference } = useInventoryCommands();
  const initialEntityKind = initial && 'kind' in initial ? initial.kind : kind === 'warehouses' ? 'general' : 'raw';
  const [form, setForm] = useState(() => ({
    name: '',
    sku: '',
    baseUnit: 'g' as StockItem['baseUnit'],
    purchaseUnit: 'kg',
    purchaseFactor: '1000',
    minQuantity: '0',
    tolerancePercent: '5',
    toleranceQuantity: '0',
    toleranceValue: '0',
    availabilityMode: 'warn' as StockItem['availabilityMode'],
    isActive: true,
    isDefault: false,
    entityKind: initialEntityKind,
    taxNumber: '',
    phone: '',
    address: '',
    ...initial,
    ...(initial && 'purchaseFactor' in initial
      ? {
          purchaseFactor: inventoryInputValue(initial.purchaseFactor),
          minQuantity: inventoryInputValue(initial.minQuantity),
          tolerancePercent: inventoryInputValue(initial.tolerancePercent),
          toleranceQuantity: inventoryInputValue(initial.toleranceQuantity),
          toleranceValue: inventoryInputValue(initial.toleranceValue),
        }
      : {}),
  }));
  const [error, setError] = useState('');
  const field = (
    key:
      | 'name'
      | 'sku'
      | 'purchaseUnit'
      | 'purchaseFactor'
      | 'minQuantity'
      | 'tolerancePercent'
      | 'toleranceQuantity'
      | 'toleranceValue'
      | 'taxNumber'
      | 'phone'
      | 'address',
    numeric = false,
  ) => (
    <TextField
      size="medium"
      fullWidth
      label={t(`fields.${key}`)}
      value={form[key] ?? ''}
      onChange={(event) => setForm({ ...form, [key]: event.target.value })}
      required={key === 'name'}
      type={numeric ? 'number' : 'text'}
      slotProps={numeric ? { htmlInput: { min: 0, step: 'any' } } : undefined}
    />
  );
  const save = async () => {
    if (!form.name.trim()) {
      setError(t('validation.name'));
      return;
    }
    if (
      kind === 'items' &&
      (!isDecimal(form.purchaseFactor) ||
        ![form.minQuantity, form.tolerancePercent, form.toleranceQuantity, form.toleranceValue ?? '0'].every((value) =>
          isDecimal(value, true),
        ))
    ) {
      setError(t('validation.quantity'));
      return;
    }
    const common = { name: form.name.trim(), isActive: form.isActive };
    const payload =
      kind === 'warehouses'
        ? { ...common, kind: form.entityKind as Warehouse['kind'], isDefault: form.isDefault }
        : kind === 'suppliers'
          ? { ...common, taxNumber: form.taxNumber, phone: form.phone, address: form.address }
          : {
              ...common,
              kind: form.entityKind as StockItem['kind'],
              sku: form.sku,
              baseUnit: form.baseUnit,
              purchaseUnit: form.purchaseUnit,
              purchaseFactor: form.purchaseFactor,
              minQuantity: form.minQuantity,
              tolerancePercent: form.tolerancePercent,
              toleranceQuantity: form.toleranceQuantity,
              ...(canViewCost ? { toleranceValue: form.toleranceValue } : {}),
              availabilityMode: form.availabilityMode,
            };
    try {
      await saveReference.mutateAsync({ kind, id: initial?.id, payload });
      onClose();
    } catch (cause) {
      setError(inventoryError(cause) || t('saveFailed'));
    }
  };
  return (
    <FormDialog
      title={t(`${initial ? 'edit' : 'add'}.${kind}`)}
      help={
        kind === 'items' ? (
          <Stack spacing={1}>
            <span>
              {t('purchaseHelp', {
                factor: form.purchaseFactor,
                unit: t(`units.${form.baseUnit}`),
                purchaseUnit: form.purchaseUnit,
              })}
            </span>
            <span>{t('toleranceHelp')}</span>
          </Stack>
        ) : undefined
      }
      onClose={onClose}
      onSubmit={() => {
        void save();
      }}
      pending={saveReference.isPending}
      error={error}>
      {field('name')}
      {kind === 'items' && (
        <>
          <TextField
            size="medium"
            select
            fullWidth
            label={t('fields.itemKind')}
            value={form.entityKind}
            onChange={(event) => setForm({ ...form, entityKind: event.target.value as typeof form.entityKind })}>
            {['raw', 'semi_finished', 'finished', 'packaging', 'non_food'].map((value) => (
              <MenuItem key={value} value={value}>
                {t(`itemKinds.${value}`)}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {field('sku')}
            <TextField
              size="medium"
              select
              fullWidth
              label={t('fields.baseUnit')}
              value={form.baseUnit}
              onChange={(event) => {
                const baseUnit = event.target.value as StockItem['baseUnit'];
                setForm({
                  ...form,
                  baseUnit,
                  ...(!initial
                    ? {
                        purchaseUnit: baseUnit === 'g' ? 'kg' : baseUnit === 'ml' ? 'l' : t('units.piece'),
                        purchaseFactor: baseUnit === 'piece' ? '1' : '1000',
                      }
                    : {}),
                });
              }}>
              {['g', 'ml', 'piece'].map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {t(`units.${unit}`)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {field('purchaseUnit')}
            {field('purchaseFactor', true)}
          </Stack>
          {field('minQuantity', true)}
          <TextField
            size="medium"
            select
            label={t('fields.availabilityMode')}
            value={form.availabilityMode}
            helperText={t('availabilityHelp')}
            onChange={(event) =>
              setForm({ ...form, availabilityMode: event.target.value as StockItem['availabilityMode'] })
            }>
            {['off', 'warn', 'block'].map((mode) => (
              <MenuItem key={mode} value={mode}>
                {t(`modes.${mode}`)}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {field('tolerancePercent', true)}
            {field('toleranceQuantity', true)}
            {canViewCost && field('toleranceValue', true)}
          </Stack>
        </>
      )}
      {kind === 'suppliers' && (
        <>
          {field('taxNumber')}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {field('phone')}
            {field('address')}
          </Stack>
        </>
      )}
      {kind === 'warehouses' && (
        <>
          <TextField
            size="medium"
            select
            fullWidth
            label={t('fields.warehouseKind')}
            value={form.entityKind}
            onChange={(event) => setForm({ ...form, entityKind: event.target.value as typeof form.entityKind })}>
            {['general', 'raw', 'production', 'sales'].map((value) => (
              <MenuItem key={value} value={value}>
                {t(`warehouseKinds.${value}`)}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            label={t('fields.isDefault')}
            control={
              <Switch checked={form.isDefault} onChange={(_, checked) => setForm({ ...form, isDefault: checked })} />
            }
          />
        </>
      )}
      <FormControlLabel
        label={t('active')}
        control={<Switch checked={form.isActive} onChange={(_, checked) => setForm({ ...form, isActive: checked })} />}
      />
    </FormDialog>
  );
}
