import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import type { CatalogModifierGroup, CatalogModifierGroupPayload } from 'shared/api/admin-types';
import { Form, RHFCheckbox, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import { useCreateCatalogModifierGroupMutation, useUpdateCatalogModifierGroupMutation } from '../../application';
import {
  modifierGroupFormSchema,
  type ModifierGroupFormInput,
  type ModifierGroupFormValues,
} from '../../data-access/modifierGroupForm.schema';

type Props = {
  group?: CatalogModifierGroup | null;
  onCancel: () => void;
  onSuccess: (group: CatalogModifierGroup) => void;
};

const emptyOption = (sortOrder = 0): ModifierGroupFormInput['options'][number] => ({
  name: '',
  priceDelta: 0,
  isDefault: false,
  sortOrder,
  isActive: true,
});

const defaultValues: ModifierGroupFormInput = {
  name: '',
  selectionType: 'single',
  minSelections: 1,
  maxSelections: 1,
  sortOrder: 0,
  isActive: true,
  options: [emptyOption()],
};

export function CatalogModifierGroupForm({ group, onCancel, onSuccess }: Props) {
  const { t } = useTranslate('catalog');
  const methods = useForm<ModifierGroupFormInput, unknown, ModifierGroupFormValues>({
    resolver: zodResolver(modifierGroupFormSchema),
    defaultValues,
  });
  const { control, getValues, handleSubmit, reset, setValue, formState } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  const selectionType = useWatch({ control, name: 'selectionType' });
  const createMutation = useCreateCatalogModifierGroupMutation();
  const updateMutation = useUpdateCatalogModifierGroupMutation(group?.id ?? '');
  const isSubmitting = formState.isSubmitting || createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    reset(
      group
        ? {
            name: group.name,
            selectionType: group.selectionType,
            minSelections: group.minSelections,
            maxSelections: group.maxSelections,
            sortOrder: group.sortOrder,
            isActive: group.isActive,
            options: group.options.map((option) => ({ ...option })),
          }
        : defaultValues,
    );
  }, [group, reset]);

  useEffect(() => {
    if (selectionType === 'single') {
      setValue('maxSelections', 1, { shouldValidate: true });
      if (Number(getValues('minSelections')) > 1) setValue('minSelections', 1, { shouldValidate: true });
    }
  }, [getValues, selectionType, setValue]);

  const submit = handleSubmit(async (values) => {
    const payload: CatalogModifierGroupPayload = {
      ...values,
      name: values.name.trim(),
      options: values.options.map((option, index) => ({
        ...option,
        name: option.name.trim(),
        sortOrder: index,
      })),
    };
    const saved = group?.id ? await updateMutation.mutateAsync(payload) : await createMutation.mutateAsync(payload);
    onSuccess(saved);
  });

  return (
    <Form methods={methods} onSubmit={submit}>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography component="span" variant="h6">
          {group ? 'Xususiyatni tahrirlash' : 'Yangi xususiyat guruhi'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: '16px !important' }}>
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1.6fr) minmax(180px, 1fr)' },
              gap: 2,
            }}>
            <RHFTextField<ModifierGroupFormInput> name="name" label="Guruh nomi" placeholder="Masalan: Xamir turi" />
            <RHFSelect<ModifierGroupFormInput> name="selectionType" label="Tanlov turi">
              <MenuItem value="single">{t('modifiers.single')}</MenuItem>
              <MenuItem value="multiple">{t('modifiers.multiple')}</MenuItem>
            </RHFSelect>
            {selectionType === 'single' ? (
              <RHFSelect<ModifierGroupFormInput> name="minSelections" label="Tanlash talabi">
                <MenuItem value={1}>{t('modifiers.requiredSingle')}</MenuItem>
                <MenuItem value={0}>{t('modifiers.optionalSingle')}</MenuItem>
              </RHFSelect>
            ) : (
              <>
                <RHFTextField<ModifierGroupFormInput> name="minSelections" label="Eng kam tanlov" type="number" />
                <RHFTextField<ModifierGroupFormInput> name="maxSelections" label="Eng ko‘p tanlov" type="number" />
              </>
            )}
          </Box>

          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1">{t('modifiers.options')}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('modifiers.freeHint')}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="text"
                color="inherit"
                startIcon={<Icon icon="mingcute:add-line" width={18} />}
                onClick={() => append(emptyOption(fields.length))}>
                {t('modifiers.quickAdd')}
              </Button>
            </Stack>

            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  py: 1.25,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ width: 20, textAlign: 'center' }}>
                    {index + 1}
                  </Typography>
                  <RHFTextField<ModifierGroupFormInput>
                    name={`options.${index}.name`}
                    label="Variant nomi"
                    placeholder="Masalan: Pishloqli bort"
                    sx={{ flex: 1 }}
                  />
                  <RHFTextField<ModifierGroupFormInput>
                    name={`options.${index}.priceDelta`}
                    label="Ustama narx"
                    type="number"
                    sx={{ width: { xs: '100%', sm: 180 } }}
                    slotProps={{
                      input: { endAdornment: <Typography variant="caption">{t('modifiers.currency')}</Typography> },
                    }}
                  />
                  <RHFCheckbox<ModifierGroupFormInput> name={`options.${index}.isDefault`} label="Oldindan tanlangan" />
                  <IconButton
                    aria-label="Variantni o‘chirish"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                    <Icon icon="solar:trash-bin-trash-bold-duotone" width={20} />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center">
            <RHFSwitch<ModifierGroupFormInput> name="isActive" label="Faol" />
            <RHFTextField<ModifierGroupFormInput> name="sortOrder" label="Tartib" type="number" sx={{ width: 130 }} />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button color="inherit" variant="outlined" onClick={onCancel} disabled={isSubmitting}>
          {t('modifiers.cancel')}
        </Button>
        <Button type="submit" variant="contained" color="black" loading={isSubmitting}>
          {group ? 'Saqlash' : 'Guruh yaratish'}
        </Button>
      </DialogActions>
    </Form>
  );
}
