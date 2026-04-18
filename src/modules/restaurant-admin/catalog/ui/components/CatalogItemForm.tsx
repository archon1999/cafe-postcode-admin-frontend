import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import type {
  AdminMxikDetails,
  AdminMxikPackage,
  CatalogImageSource,
  CatalogItem,
  CatalogItemPayload,
} from 'shared/api/admin-types';
import { FormActions } from 'shared/ui/FormActions';
import { Form, RHFSelect, RHFSumCurrencyField, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { LabelRow } from 'shared/ui/LabelRow/LabelRow';

import {
  useCreateCatalogItemMutation,
  useGetCatalogCategoriesQuery,
  useGetMxikDetailsQuery,
  useGetPrepStationsQuery,
  useUpdateCatalogItemMutation,
} from '../../application';
import { getMxikPrimaryPictureUrl } from '../../data-access';

import { CatalogImageEditor } from './CatalogImageEditor';
import { buildMxikOption, MxikAutocompleteField } from './MxikAutocompleteField';

const mxikOptionSchema = z
  .object({
    value: z.string().min(1),
    code: z.string().min(1),
    label: z.string().min(1),
    name: z.string().optional(),
    raw: z.record(z.string(), z.unknown()).optional(),
  })
  .nullable()
  .optional();

const imageFieldSchema = z.custom<File | string | null | undefined>(
  (value) => value === undefined || value === null || typeof value === 'string' || value instanceof File,
);

const itemFormSchema = z.object({
  name: z.string().min(1, { message: 'Nomi talab qilinadi' }),
  category: z.string().optional(),
  prepStation: z.string().optional(),
  description: z.string().optional(),
  mxik: mxikOptionSchema,
  imageFile: imageFieldSchema.optional(),
  imageSource: z.enum(['mxik-cache', 'manual', '']),
  clearImage: z.boolean(),
  restoreMxikImage: z.boolean(),
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
  imageFile: null,
  imageSource: '',
  clearImage: false,
  restoreMxikImage: false,
  price: 0,
  isActive: true,
  isStoplisted: false,
};

function getMxikDetailLang(lang: string) {
  return lang === 'ru' ? 'ru' : 'uz_latn';
}

function getMxikImageLang(lang: string) {
  return lang === 'ru' ? 'ru' : 'uz';
}

function formatMxikFlag(value: number | null | undefined, yesLabel: string, noLabel: string) {
  if (value === null || value === undefined) {
    return '';
  }

  if (value === 1) {
    return `${yesLabel} (${value})`;
  }

  if (value === 0) {
    return `${noLabel} (${value})`;
  }

  return String(value);
}

function formatPackageValue(pkg: AdminMxikPackage | null | undefined) {
  if (!pkg) {
    return '';
  }

  return [pkg.code, pkg.name || pkg.unitName || pkg.containerName].filter(Boolean).join(' - ');
}

function getLabelStatus(details: AdminMxikDetails | null | undefined, fallbackRaw?: Record<string, unknown>) {
  if (details?.labelStatus !== null && details?.labelStatus !== undefined) {
    return details.labelStatus;
  }

  const rawValue = fallbackRaw?.label;
  return typeof rawValue === 'number' ? rawValue : null;
}

function getCashSaleStatus(details: AdminMxikDetails | null | undefined, fallbackRaw?: Record<string, unknown>) {
  if (details?.cashSale !== null && details?.cashSale !== undefined) {
    return details.cashSale;
  }

  const rawValue = fallbackRaw?.cashSale;
  return typeof rawValue === 'number' ? rawValue : null;
}

function formatCashSaleRestriction(
  value: number | null | undefined,
  labels: {
    forbidden: string;
    limited: string;
    unlimited: string;
  },
) {
  if (value === null || value === undefined) {
    return '';
  }

  if (value === 0) {
    return labels.forbidden;
  }

  if (value === 1) {
    return labels.limited;
  }

  if (value === 2) {
    return labels.unlimited;
  }

  return String(value);
}

function CatalogItemFormInner({
  item,
  defaultCategoryId,
  onCancel,
  onSuccess,
  isDialog,
}: CatalogItemFormProps & { isDialog: boolean }) {
  const { t, currentLang } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');
  const isEditMode = Boolean(item?.id);
  const [mxikImageUrl, setMxikImageUrl] = useState<string | null>(null);

  const categoriesQuery = useGetCatalogCategoriesQuery();
  const prepStationsQuery = useGetPrepStationsQuery();
  const createMutation = useCreateCatalogItemMutation();
  const updateMutation = useUpdateCatalogItemMutation(item?.id ?? '');

  const methods = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset, formState, watch, setValue, getValues } = methods;
  const selectedMxik = watch('mxik');
  const selectedImage = watch('imageFile');
  const mxikDetailsQuery = useGetMxikDetailsQuery(
    { code: selectedMxik?.code, lang: getMxikDetailLang(currentLang.value) },
    { enabled: Boolean(selectedMxik?.code) },
  );
  const isSubmitting = formState.isSubmitting || createMutation.isPending || updateMutation.isPending;
  const mxikNameValue = mxikDetailsQuery.data?.name || selectedMxik?.name || '';
  const primaryPackage = mxikDetailsQuery.data?.primaryPackage ?? null;
  const cashSaleStatus = getCashSaleStatus(mxikDetailsQuery.data, selectedMxik?.raw);
  const labelStatus = getLabelStatus(mxikDetailsQuery.data, selectedMxik?.raw);

  useEffect(() => {
    reset({
      name: item?.name ?? '',
      category: item?.category ?? defaultCategoryId ?? '',
      prepStation: item?.prepStation ?? '',
      description: item?.description ?? '',
      mxik: buildMxikOption(item?.mxikCode, item?.mxikName, item?.mxikPayload),
      imageFile: item?.imageUrl ?? null,
      imageSource: (item?.imageSource ?? '') as CatalogImageSource | '',
      clearImage: false,
      restoreMxikImage: false,
      price: item?.price ?? 0,
      isActive: item?.isActive ?? true,
      isStoplisted: item?.isStoplisted ?? false,
    });
    setMxikImageUrl(item?.imageSource === 'mxik-cache' ? (item.imageUrl ?? null) : null);
  }, [defaultCategoryId, item, reset]);

  useEffect(() => {
    if (!(selectedImage instanceof File)) {
      return;
    }

    setValue('imageSource', 'manual', { shouldDirty: true, shouldValidate: true });
    setValue('clearImage', false, { shouldDirty: true });
    setValue('restoreMxikImage', false, { shouldDirty: true });
  }, [selectedImage, setValue]);

  useEffect(() => {
    let isActive = true;

    if (!selectedMxik?.code) {
      setMxikImageUrl(null);
      if (getValues('imageSource') !== 'manual') {
        setValue('imageFile', null, { shouldDirty: false });
        setValue('imageSource', '', { shouldDirty: false });
        setValue('restoreMxikImage', false, { shouldDirty: false });
      }
      return () => {
        isActive = false;
      };
    }

    void (async () => {
      const nextImageUrl =
        (await getMxikPrimaryPictureUrl(selectedMxik.code, getMxikImageLang(currentLang.value))) || null;

      if (!isActive) {
        return;
      }

      setMxikImageUrl(nextImageUrl);

      if (getValues('imageSource') === 'manual') {
        return;
      }

      setValue('clearImage', false, { shouldDirty: false });
      setValue('restoreMxikImage', false, { shouldDirty: false });
      setValue('imageFile', nextImageUrl, { shouldDirty: false });
      setValue('imageSource', nextImageUrl ? 'mxik-cache' : '', { shouldDirty: false });
    })();

    return () => {
      isActive = false;
    };
  }, [currentLang.value, getValues, selectedMxik?.code, setValue]);

  const handleClearImage = () => {
    setValue('imageFile', null, { shouldDirty: true, shouldValidate: true });
    setValue('imageSource', '', { shouldDirty: true, shouldValidate: true });
    setValue('clearImage', true, { shouldDirty: true });
    setValue('restoreMxikImage', false, { shouldDirty: true });
  };

  const handleRestoreMxikImage = () => {
    setValue('imageFile', mxikImageUrl, { shouldDirty: true, shouldValidate: true });
    setValue('imageSource', mxikImageUrl ? 'mxik-cache' : '', { shouldDirty: true, shouldValidate: true });
    setValue('clearImage', false, { shouldDirty: true });
    setValue('restoreMxikImage', true, { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    const resolvedMxikImageUrl = values.mxik?.code
      ? (await getMxikPrimaryPictureUrl(values.mxik.code, getMxikImageLang(currentLang.value))) || null
      : null;
    const normalizedImageSource: CatalogItemPayload['imageSource'] =
      values.imageFile instanceof File
        ? 'manual'
        : values.clearImage
          ? ''
          : values.restoreMxikImage
            ? resolvedMxikImageUrl
              ? 'mxik-cache'
              : ''
            : values.imageSource;

    const payload: CatalogItemPayload = {
      name: values.name.trim(),
      category: values.category || null,
      prepStation: values.prepStation || null,
      description: values.description?.trim() ?? '',
      mxikCode: values.mxik?.code ?? '',
      mxikName: values.mxik?.name ?? '',
      mxikPayload: values.mxik?.raw ?? {},
      imageUrl: resolvedMxikImageUrl,
      imageSource: normalizedImageSource,
      imageFile: values.imageFile instanceof File ? values.imageFile : null,
      clearImage: values.clearImage,
      restoreMxikImage: values.restoreMxikImage,
      price: values.price,
      isActive: values.isActive,
      isStoplisted: values.isStoplisted,
    };

    const savedItem =
      isEditMode && item ? await updateMutation.mutateAsync(payload) : await createMutation.mutateAsync(payload);

    onSuccess?.(savedItem);
  });

  const title = isEditMode ? t('pages.itemEdit.title') : t('pages.itemCreate.title');

  const fields = (
    <Stack spacing={3} sx={isDialog ? { pt: 1 } : undefined}>
      <CatalogImageEditor<ItemFormValues>
        imageName="imageFile"
        imageSourceName="imageSource"
        mxikImageUrl={mxikImageUrl}
        disabled={isSubmitting}
        onClearImage={handleClearImage}
        onRestoreMxikImage={handleRestoreMxikImage}
      />

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
          onPicked={(picked) => {
            if (!picked?.name) {
              return;
            }

            setValue('name', picked.name, { shouldDirty: true, shouldValidate: true });
          }}
        />
        {selectedMxik?.code ? (
          <Box
            sx={{
              gridColumn: { xs: 'auto', md: '1 / -1' },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.neutral',
              p: 2,
            }}>
            <Stack spacing={1.25} divider={<Divider flexItem />}>
              <Typography variant="subtitle2">{t('labels.mxikDetails')}</Typography>
              <LabelRow
                label={t('fields.mxikProductName')}
                value={mxikDetailsQuery.isLoading && !mxikNameValue ? tCommon('labels.loading') : mxikNameValue}
              />
              <LabelRow
                label={t('fields.packageCodeWithField')}
                value={
                  mxikDetailsQuery.isLoading && !primaryPackage
                    ? tCommon('labels.loading')
                    : formatPackageValue(primaryPackage)
                }
              />
              <LabelRow
                label={t('fields.cashSaleRestriction')}
                value={
                  mxikDetailsQuery.isLoading && cashSaleStatus === null
                    ? tCommon('labels.loading')
                    : formatCashSaleRestriction(cashSaleStatus, {
                        forbidden: t('labels.cashSaleForbidden'),
                        limited: t('labels.cashSaleLimited'),
                        unlimited: t('labels.cashSaleUnlimited'),
                      })
                }
              />
              <LabelRow
                label={t('fields.labelStatusWithField')}
                value={
                  mxikDetailsQuery.isLoading && labelStatus === null
                    ? tCommon('labels.loading')
                    : formatMxikFlag(labelStatus, tCommon('labels.yes'), tCommon('labels.no'))
                }
              />
            </Stack>
          </Box>
        ) : null}
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
            {isEditMode ? t('actions.save') : t('actions.create')}
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
          submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
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
