import { zodResolver } from '@hookform/resolvers/zod';
import Card from '@mui/material/Card';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import type { CatalogImageSource, CatalogItem, CatalogItemPayload } from 'shared/api/admin-types';
import { EntityFormActions } from 'shared/ui/EntityFormActions';
import { Form } from 'shared/ui/HookForm';

import {
  useCreateCatalogItemMutation,
  useDeleteCatalogItemMutation,
  useGetCatalogCategoriesQuery,
  useGetMxikDetailsQuery,
  useGetCatalogModifierGroupsQuery,
  useUpdateCatalogItemMutation,
} from '../../application';
import { getMxikPrimaryPictureUrl } from '../../data-access';
import {
  catalogItemFormSchema,
  type CatalogItemFormInput,
  type CatalogItemFormValues,
} from '../../data-access/catalogItemForm.schema';

import { CatalogItemFormFields } from './CatalogItemFormFields';
import { getMxikDetailLang, getMxikImageLang } from './catalogItemMxik';
import { buildMxikOption } from './MxikAutocompleteField';

type CatalogItemFormProps = {
  item?: CatalogItem | null;
  defaultCategoryId?: string | null;
  onCancel?: () => void;
  onDeleted?: () => void;
  onSuccess?: (item: CatalogItem) => void;
};

const defaultValues: CatalogItemFormInput = {
  name: '',
  category: '',
  description: '',
  mxik: null,
  imageFile: null,
  imageSource: '',
  clearImage: false,
  restoreMxikImage: false,
  price: 0,
  modifierGroups: [],
  isActive: true,
  isStoplisted: false,
};

function CatalogItemFormInner({
  item,
  defaultCategoryId,
  onCancel,
  onDeleted,
  onSuccess,
  isDialog,
}: CatalogItemFormProps & { isDialog: boolean }) {
  const { t, currentLang } = useTranslate('catalog');
  const isEditMode = Boolean(item?.id);
  const [mxikImageUrl, setMxikImageUrl] = useState<string | null>(null);
  const categoriesQuery = useGetCatalogCategoriesQuery();
  const modifierGroupsQuery = useGetCatalogModifierGroupsQuery();
  const createMutation = useCreateCatalogItemMutation();
  const updateMutation = useUpdateCatalogItemMutation(item?.id ?? '');
  const deleteMutation = useDeleteCatalogItemMutation();
  const methods = useForm<CatalogItemFormInput, unknown, CatalogItemFormValues>({
    resolver: zodResolver(catalogItemFormSchema),
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

  useEffect(() => {
    reset({
      name: item?.name ?? '',
      category: item?.category ?? defaultCategoryId ?? '',
      description: item?.description ?? '',
      mxik: buildMxikOption(item?.mxikCode, item?.mxikName, item?.mxikPayload),
      imageFile: item?.imageUrl ?? null,
      imageSource: (item?.imageSource ?? '') as CatalogImageSource | '',
      clearImage: false,
      restoreMxikImage: false,
      price: item?.price ?? 0,
      modifierGroups: item?.modifierGroups ?? [],
      isActive: item?.isActive ?? true,
      isStoplisted: item?.isStoplisted ?? false,
    });
    setMxikImageUrl(item?.imageSource === 'mxik-cache' ? (item.imageUrl ?? null) : null);
  }, [defaultCategoryId, item, reset]);

  useEffect(() => {
    if (!(selectedImage instanceof File)) return;
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
      if (!isActive) return;
      setMxikImageUrl(nextImageUrl);
      if (getValues('imageSource') === 'manual') return;
      setValue('clearImage', false, { shouldDirty: false });
      setValue('restoreMxikImage', false, { shouldDirty: false });
      setValue('imageFile', nextImageUrl, { shouldDirty: false });
      setValue('imageSource', nextImageUrl ? 'mxik-cache' : '', { shouldDirty: false });
    })();

    return () => {
      isActive = false;
    };
  }, [currentLang.value, getValues, selectedMxik?.code, setValue]);

  const clearImage = () => {
    setValue('imageFile', null, { shouldDirty: true, shouldValidate: true });
    setValue('imageSource', '', { shouldDirty: true, shouldValidate: true });
    setValue('clearImage', true, { shouldDirty: true });
    setValue('restoreMxikImage', false, { shouldDirty: true });
  };
  const restoreMxikImage = () => {
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
      modifierGroups: values.modifierGroups,
      isActive: values.isActive,
      isStoplisted: values.isStoplisted,
    };
    const savedItem =
      isEditMode && item ? await updateMutation.mutateAsync(payload) : await createMutation.mutateAsync(payload);
    onSuccess?.(savedItem);
  });

  const title = isEditMode ? t('pages.itemEdit.title') : t('pages.itemCreate.title');
  const fields = (
    <CatalogItemFormFields
      categories={categoriesQuery.data ?? []}
      categoriesLoading={categoriesQuery.isLoading}
      modifierGroups={modifierGroupsQuery.data ?? []}
      modifierGroupsLoading={modifierGroupsQuery.isLoading}
      disabled={isSubmitting}
      isDialog={isDialog}
      mxikDetails={mxikDetailsQuery.data}
      mxikDetailsLoading={mxikDetailsQuery.isLoading}
      mxikImageUrl={mxikImageUrl}
      selectedMxik={selectedMxik}
      onClearImage={clearImage}
      onRestoreMxikImage={restoreMxikImage}
      onMxikNamePicked={(name) => setValue('name', name, { shouldDirty: true, shouldValidate: true })}
    />
  );

  if (isDialog) {
    return (
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{fields}</DialogContent>
        <EntityFormActions
          isDialog
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          isDeleting={deleteMutation.isPending}
          submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
          deleteTitle={t('dialogs.deleteItem.title')}
          deleteContent={t('dialogs.deleteItem.description', { name: item?.name ?? '' })}
          onCancel={onCancel}
          onDelete={async () => {
            if (!item) return;
            await deleteMutation.mutateAsync(item.id);
            (onDeleted ?? onCancel)?.();
          }}
        />
      </Form>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Form methods={methods} onSubmit={onSubmit}>
        {fields}
        <EntityFormActions
          isDialog={false}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          isDeleting={deleteMutation.isPending}
          submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
          deleteTitle={t('dialogs.deleteItem.title')}
          deleteContent={t('dialogs.deleteItem.description', { name: item?.name ?? '' })}
          onCancel={onCancel}
          onDelete={async () => {
            if (!item) return;
            await deleteMutation.mutateAsync(item.id);
            (onDeleted ?? onCancel)?.();
          }}
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
