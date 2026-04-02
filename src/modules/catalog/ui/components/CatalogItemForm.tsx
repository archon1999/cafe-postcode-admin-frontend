import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import type { CatalogItem } from 'shared/api/admin-types';
import { FormActions } from 'shared/ui/FormActions';
import { Form, RHFSelect, RHFSumCurrencyField, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import {
  useCreateCatalogItemMutation,
  useGetCatalogCategoriesQuery,
  useGetPrepStationsQuery,
  useUpdateCatalogItemMutation,
} from '../../application';

import { buildMxikOption, MxikAutocompleteField } from './MxikAutocompleteField';

const mxikOptionSchema = z
  .object({
    value: z.string().min(1),
    code: z.string().min(1),
    label: z.string().min(1),
    name: z.string().optional(),
  })
  .nullable()
  .optional();

const itemFormSchema = z.object({
  name: z.string().min(1, { message: 'Nomi talab qilinadi' }),
  category: z.string().optional(),
  prepStation: z.string().optional(),
  description: z.string().optional(),
  mxik: mxikOptionSchema,
  price: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? 0 : value),
    z.coerce.number().int().min(0),
  ),
  isActive: z.boolean(),
  isStoplisted: z.boolean(),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

type CatalogItemFormProps = {
  item?: CatalogItem | null;
  defaultCategoryId?: string | null;
  onCancel?: () => void;
  onSuccess?: (item: CatalogItem) => void;
};

const defaultValues: ItemFormValues = {
  name: '',
  category: '',
  prepStation: '',
  description: '',
  mxik: null,
  price: 0,
  isActive: true,
  isStoplisted: false,
};

function CatalogItemFormInner({
  item,
  defaultCategoryId,
  onCancel,
  onSuccess,
  isDialog,
}: CatalogItemFormProps & { isDialog: boolean }) {
  const { t } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');
  const isEditMode = Boolean(item?.id);

  const categoriesQuery = useGetCatalogCategoriesQuery();
  const prepStationsQuery = useGetPrepStationsQuery();
  const createMutation = useCreateCatalogItemMutation();
  const updateMutation = useUpdateCatalogItemMutation(item?.id ?? '');

  const methods = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset, formState } = methods;
  const isSubmitting = formState.isSubmitting || createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    reset({
      name: item?.name ?? '',
      category: item?.category ?? defaultCategoryId ?? '',
      prepStation: item?.prepStation ?? '',
      description: item?.description ?? '',
      mxik: buildMxikOption(item?.mxikCode, item?.mxikName),
      price: item?.price ?? 0,
      isActive: item?.isActive ?? true,
      isStoplisted: item?.isStoplisted ?? false,
    });
  }, [defaultCategoryId, item, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      category: values.category || null,
      prepStation: values.prepStation || null,
      description: values.description?.trim() ?? '',
      mxikCode: values.mxik?.code ?? '',
      mxikName: values.mxik?.name ?? '',
      price: values.price,
      isActive: values.isActive,
      isStoplisted: values.isStoplisted,
    };

    const savedItem =
      isEditMode && item ? await updateMutation.mutateAsync(payload) : await createMutation.mutateAsync(payload);

    onSuccess?.(savedItem);
  });

  const title = isEditMode
    ? t('pages.itemEdit.title', { defaultValue: 'Mahsulotni tahrirlash' })
    : t('pages.itemCreate.title', { defaultValue: 'Yangi mahsulot' });

  const fields = (
    <Stack spacing={3} sx={isDialog ? { pt: 1 } : undefined}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
        }}>
        <RHFTextField<ItemFormValues> name="name" label={t('fields.name')} />
        <RHFSelect<ItemFormValues>
          name="category"
          label={t('fields.category')}
          helperText={categoriesQuery.isLoading ? tCommon('labels.loading') : undefined}>
          <MenuItem value="">{t('filters.all')}</MenuItem>
          {(categoriesQuery.data ?? []).map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </RHFSelect>
        <RHFSelect<ItemFormValues>
          name="prepStation"
          label={t('fields.prepStation')}
          helperText={prepStationsQuery.isLoading ? tCommon('labels.loading') : undefined}>
          <MenuItem value="">{t('filters.all')}</MenuItem>
          {(prepStationsQuery.data ?? []).map((station) => (
            <MenuItem key={station.id} value={station.id}>
              {station.name}
            </MenuItem>
          ))}
        </RHFSelect>
        <MxikAutocompleteField<ItemFormValues>
          name="mxik"
          label={t('fields.mxikCode')}
          helperText={t('labels.mxikOptional')}
          placeholder={t('actions.searchMxik')}
        />
        <RHFSumCurrencyField<ItemFormValues> name="price" label={t('fields.price')} />
        <RHFTextField<ItemFormValues>
          name="description"
          label={t('fields.description')}
          multiline
          rows={4}
          sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}
        />
      </Box>

      <Stack spacing={2}>
        <RHFSwitch<ItemFormValues> name="isActive" label={t('fields.status')} />
        <RHFSwitch<ItemFormValues> name="isStoplisted" label={t('fields.stoplist')} />
      </Stack>
    </Stack>
  );

  if (isDialog) {
    return (
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{fields}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button color="inherit" variant="outlined" onClick={onCancel} disabled={isSubmitting}>
            {tCommon('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" color="black" loading={isSubmitting}>
            {isEditMode
              ? t('actions.save', { defaultValue: 'Saqlash' })
              : t('actions.create', { defaultValue: 'Yaratish' })}
          </Button>
        </DialogActions>
      </Form>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Form methods={methods} onSubmit={onSubmit}>
        {fields}
        <FormActions
          isSubmitting={isSubmitting}
          submitLabel={
            isEditMode
              ? t('actions.save', { defaultValue: 'Saqlash' })
              : t('actions.create', { defaultValue: 'Yaratish' })
          }
          onCancel={onCancel}
        />
      </Form>
    </Card>
  );
}

export function CatalogItemFormCard(props: CatalogItemFormProps) {
  return <CatalogItemFormInner {...props} isDialog={false} />;
}

export function CatalogItemFormDialog(props: CatalogItemFormProps) {
  return <CatalogItemFormInner {...props} isDialog />;
}
