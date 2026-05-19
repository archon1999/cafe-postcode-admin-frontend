import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import type { CatalogCategory, CatalogCategoryPayload, CatalogImageSource } from 'shared/api/admin-types';
import { FormActions } from 'shared/ui/FormActions';
import { Form, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import { useCreateCatalogCategoryMutation, useUpdateCatalogCategoryMutation } from '../../application';
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
  .refine((value) => Boolean(value?.code), { message: 'MXIK kodi talab qilinadi' });

const imageFieldSchema = z.custom<File | string | null | undefined>(
  (value) => value === undefined || value === null || typeof value === 'string' || value instanceof File,
);

const categoryFormSchema = z.object({
  name: z.string().min(1, { message: 'Nomi talab qilinadi' }),
  mxik: mxikOptionSchema,
  imageFile: imageFieldSchema.optional(),
  imageSource: z.enum(['mxik-cache', 'manual', '']),
  clearImage: z.boolean(),
  restoreMxikImage: z.boolean(),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

type CatalogCategoryFormProps = {
  category?: CatalogCategory | null;
  onCancel?: () => void;
  onSuccess?: (category: CatalogCategory) => void;
};

const defaultValues: CategoryFormValues = {
  name: '',
  mxik: null,
  imageFile: null,
  imageSource: '',
  clearImage: false,
  restoreMxikImage: false,
  sortOrder: 0,
  isActive: true,
};

function getMxikImageLang(lang: string) {
  return lang === 'ru' ? 'ru' : 'uz';
}

function CatalogCategoryFormInner({
  category,
  onCancel,
  onSuccess,
  isDialog,
}: CatalogCategoryFormProps & { isDialog: boolean }) {
  const { t, currentLang } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');
  const isEditMode = Boolean(category?.id);
  const [mxikImageUrl, setMxikImageUrl] = useState<string | null>(null);

  const createMutation = useCreateCatalogCategoryMutation();
  const updateMutation = useUpdateCatalogCategoryMutation(category?.id ?? '');

  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema) as Resolver<CategoryFormValues>,
    defaultValues,
  });

  const { handleSubmit, reset, formState, watch, setValue, getValues } = methods;
  const isSubmitting = formState.isSubmitting || createMutation.isPending || updateMutation.isPending;
  const selectedMxikCode = watch('mxik')?.code ?? '';
  const selectedImage = watch('imageFile');

  useEffect(() => {
    reset({
      name: category?.name ?? '',
      mxik: buildMxikOption(category?.mxikCode, category?.mxikName, category?.mxikPayload),
      imageFile: category?.imageUrl ?? null,
      imageSource: (category?.imageSource ?? '') as CatalogImageSource | '',
      clearImage: false,
      restoreMxikImage: false,
      sortOrder: category?.sortOrder ?? 0,
      isActive: category?.isActive ?? true,
    });
    setMxikImageUrl(category?.imageSource === 'mxik-cache' ? (category.imageUrl ?? null) : null);
  }, [category, reset]);

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

    if (!selectedMxikCode) {
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
        (await getMxikPrimaryPictureUrl(selectedMxikCode, getMxikImageLang(currentLang.value))) || null;

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
  }, [currentLang.value, getValues, selectedMxikCode, setValue]);

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
    if (!values.mxik) {
      return;
    }

    const resolvedMxikImageUrl =
      (await getMxikPrimaryPictureUrl(values.mxik.code, getMxikImageLang(currentLang.value))) || null;
    const normalizedImageSource: CatalogCategoryPayload['imageSource'] =
      values.imageFile instanceof File
        ? 'manual'
        : values.clearImage
          ? ''
          : values.restoreMxikImage
            ? resolvedMxikImageUrl
              ? 'mxik-cache'
              : ''
            : values.imageSource;

    const payload: CatalogCategoryPayload = {
      name: values.name.trim(),
      mxikCode: values.mxik.code,
      mxikName: values.mxik.name ?? '',
      mxikPayload: values.mxik.raw ?? {},
      imageUrl: resolvedMxikImageUrl,
      imageSource: normalizedImageSource,
      imageFile: values.imageFile instanceof File ? values.imageFile : null,
      clearImage: values.clearImage,
      restoreMxikImage: values.restoreMxikImage,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    const savedCategory =
      isEditMode && category ? await updateMutation.mutateAsync(payload) : await createMutation.mutateAsync(payload);

    onSuccess?.(savedCategory);
  });

  const title = isEditMode ? t('pages.categoryEdit.title') : t('pages.categoryCreate.title');

  const fields = (
    <Stack spacing={3} sx={isDialog ? { pt: 1 } : undefined}>
      <CatalogImageEditor<CategoryFormValues>
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
        <RHFTextField<CategoryFormValues> name="name" label={t('fields.name')} />
        <MxikAutocompleteField<CategoryFormValues>
          name="mxik"
          label={t('fields.mxikCode')}
          helperText={t('labels.mxikRequired')}
          placeholder={t('actions.searchMxik')}
          required
        />
        <RHFTextField<CategoryFormValues> name="sortOrder" label={t('fields.sortOrder')} type="number" />
      </Box>

      <RHFSwitch<CategoryFormValues> name="isActive" label={t('fields.status')} />
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

export function CatalogCategoryFormCard(props: CatalogCategoryFormProps) {
  return <CatalogCategoryFormInner {...props} isDialog={false} />;
}

export function CatalogCategoryFormDialog(props: CatalogCategoryFormProps) {
  return <CatalogCategoryFormInner {...props} isDialog />;
}
