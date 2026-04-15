import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import type { CatalogCategory, CatalogCategoryPayload } from 'shared/api/admin-types';
import { FormActions } from 'shared/ui/FormActions';
import { Form, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import { useCreateCatalogCategoryMutation, useUpdateCatalogCategoryMutation } from '../../application';
import { getMxikPrimaryPictureUrl } from '../../data-access';

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

const categoryFormSchema = z.object({
  name: z.string().min(1, { message: 'Nomi talab qilinadi' }),
  mxik: mxikOptionSchema,
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
  sortOrder: 0,
  isActive: true,
};

function CatalogCategoryFormInner({
  category,
  onCancel,
  onSuccess,
  isDialog,
}: CatalogCategoryFormProps & { isDialog: boolean }) {
  const { t, currentLang } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');
  const isEditMode = Boolean(category?.id);

  const createMutation = useCreateCatalogCategoryMutation();
  const updateMutation = useUpdateCatalogCategoryMutation(category?.id ?? '');

  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset, formState } = methods;
  const isSubmitting = formState.isSubmitting || createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    reset({
      name: category?.name ?? '',
      mxik: buildMxikOption(category?.mxikCode, category?.mxikName, category?.mxikPayload),
      sortOrder: category?.sortOrder ?? 0,
      isActive: category?.isActive ?? true,
    });
  }, [category, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!values.mxik) {
      return;
    }

    const shouldSyncMxikImage =
      !category ||
      values.mxik.code !== (category.mxikCode ?? '') ||
      category.imageSource === 'mxik-cache' ||
      !category.imageUrl;
    const imagePayload: Pick<CatalogCategoryPayload, 'imageUrl' | 'imageSource'> = {};

    if (shouldSyncMxikImage) {
      const imageUrl = await getMxikPrimaryPictureUrl(values.mxik.code, currentLang.value === 'ru' ? 'ru' : 'uz');
      const imageSource: CatalogCategoryPayload['imageSource'] = imageUrl ? 'mxik-cache' : '';

      imagePayload.imageUrl = imageUrl || null;
      imagePayload.imageSource = imageSource;
    }

    const payload = {
      name: values.name.trim(),
      mxikCode: values.mxik.code,
      mxikName: values.mxik.name ?? '',
      mxikPayload: values.mxik.raw ?? {},
      sortOrder: values.sortOrder,
      isActive: values.isActive,
      ...imagePayload,
    };

    const savedCategory =
      isEditMode && category ? await updateMutation.mutateAsync(payload) : await createMutation.mutateAsync(payload);

    onSuccess?.(savedCategory);
  });

  const title = isEditMode
    ? t('pages.categoryEdit.title')
    : t('pages.categoryCreate.title');

  const fields = (
    <Stack spacing={3} sx={isDialog ? { pt: 1 } : undefined}>
      {category?.imageUrl ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
            gap: 2.5,
            alignItems: 'center',
            p: 2,
            borderRadius: 2.5,
            bgcolor: 'background.neutral',
          }}>
          <Box
            sx={{
              overflow: 'hidden',
              borderRadius: 2,
              aspectRatio: '1 / 1',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}>
            <Box
              component="img"
              src={category.imageUrl}
              alt={category.name}
              sx={{ width: 1, height: 1, objectFit: 'cover' }}
            />
          </Box>

          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1">
                {t('labels.mxikImagePreview')}
              </Typography>
              {category.imageSource ? (
                <Chip
                  size="small"
                  variant="soft"
                  color={category.imageSource === 'mxik-cache' ? 'info' : 'default'}
                  label={
                    category.imageSource === 'mxik-cache'
                      ? t('labels.mxikImageSource')
                      : category.imageSource
                  }
                />
              ) : null}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t('labels.mxikImagePreviewDescription')}
            </Typography>
          </Stack>
        </Box>
      ) : null}

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
            {isEditMode
              ? t('actions.save')
              : t('actions.create')}
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
              ? t('actions.save')
              : t('actions.create')
          }
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
