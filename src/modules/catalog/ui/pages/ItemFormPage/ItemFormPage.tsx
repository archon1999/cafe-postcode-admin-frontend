import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form, RHFSelect, RHFSumCurrencyField, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import {
  useCreateCatalogItemMutation,
  useGetCatalogCategoriesQuery,
  useGetCatalogItemByIdQuery,
  useGetPrepStationsQuery,
  useUpdateCatalogItemMutation,
} from '../../../application';
import { buildMxikOption, MxikAutocompleteField } from '../../components/MxikAutocompleteField';

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
  kind: z.enum(['dish', 'drink', 'service', 'penalty']),
  category: z.string().optional(),
  prepStation: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  mxik: mxikOptionSchema,
  price: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? 0 : value),
    z.coerce.number().int().min(0),
  ),
  isActive: z.boolean(),
  isStoplisted: z.boolean(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

const defaultValues: ItemFormValues = {
  name: '',
  kind: 'dish',
  category: '',
  prepStation: '',
  description: '',
  sku: '',
  mxik: null,
  price: 0,
  isActive: true,
  isStoplisted: false,
};

const ItemFormPage = () => {
  const { t } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);

  const categoriesQuery = useGetCatalogCategoriesQuery();
  const prepStationsQuery = useGetPrepStationsQuery();
  const itemQuery = useGetCatalogItemByIdQuery(id ?? '', { enabled: isEditMode });
  const createMutation = useCreateCatalogItemMutation();
  const updateMutation = useUpdateCatalogItemMutation(id ?? '');

  useRedirectOnNotFound(itemQuery.error, isEditMode);

  const methods = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (!itemQuery.data) return;

    reset({
      name: itemQuery.data.name,
      kind: itemQuery.data.kind,
      category: itemQuery.data.category ?? '',
      prepStation: itemQuery.data.prepStation ?? '',
      description: itemQuery.data.description ?? '',
      sku: itemQuery.data.sku ?? '',
      mxik: buildMxikOption(itemQuery.data.mxikCode, itemQuery.data.mxikName),
      price: itemQuery.data.price ?? 0,
      isActive: itemQuery.data.isActive,
      isStoplisted: itemQuery.data.isStoplisted,
    });
  }, [itemQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      kind: values.kind,
      category: values.category || null,
      prepStation: values.prepStation || null,
      description: values.description?.trim() ?? '',
      sku: values.sku?.trim() ?? '',
      mxikCode: values.mxik?.code ?? '',
      mxikName: values.mxik?.name ?? '',
      price: values.price,
      isActive: values.isActive,
      isStoplisted: values.isStoplisted,
    };

    if (isEditMode && id) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    push(RoutePath.catalogItemList);
  });

  if (isEditMode && itemQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={
          isEditMode
            ? t('pages.itemEdit.title', { defaultValue: 'Mahsulotni tahrirlash' })
            : t('pages.itemCreate.title', { defaultValue: 'Yangi mahsulot' })
        }
        links={[
          { name: t('pages.items.title'), href: RoutePath.catalogItemList },
          {
            name: isEditMode
              ? t('pages.itemEdit.title', { defaultValue: 'Mahsulotni tahrirlash' })
              : t('pages.itemCreate.title', { defaultValue: 'Yangi mahsulot' }),
          },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 3,
              }}>
              <RHFTextField<ItemFormValues> name="name" label={t('fields.name')} />
              <RHFSelect<ItemFormValues> name="kind" label={t('fields.kind')}>
                <MenuItem value="dish">{t('kinds.dish')}</MenuItem>
                <MenuItem value="drink">{t('kinds.drink')}</MenuItem>
                <MenuItem value="service">{t('kinds.service')}</MenuItem>
                <MenuItem value="penalty">{t('kinds.penalty')}</MenuItem>
              </RHFSelect>
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
              <RHFTextField<ItemFormValues> name="sku" label={t('fields.sku')} />
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

            <FormActions
              isSubmitting={formState.isSubmitting || createMutation.isPending || updateMutation.isPending}
              submitLabel={
                isEditMode
                  ? t('actions.save', { defaultValue: 'Saqlash' })
                  : t('actions.create', { defaultValue: 'Yaratish' })
              }
              onCancel={() => push(RoutePath.catalogItemList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default ItemFormPage;
