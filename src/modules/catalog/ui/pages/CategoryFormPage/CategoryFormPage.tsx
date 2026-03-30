import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import { Form, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import {
  useCreateCatalogCategoryMutation,
  useGetCatalogCategoryByIdQuery,
  useUpdateCatalogCategoryMutation,
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
  .refine((value) => Boolean(value?.code), { message: 'MXIK kodi talab qilinadi' });

const categoryFormSchema = z.object({
  name: z.string().min(1, { message: 'Nomi talab qilinadi' }),
  mxik: mxikOptionSchema,
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const defaultValues: CategoryFormValues = {
  name: '',
  mxik: null,
  sortOrder: 0,
  isActive: true,
};

const CategoryFormPage = () => {
  const { t } = useTranslate('catalog');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);

  const categoryQuery = useGetCatalogCategoryByIdQuery(id ?? '', { enabled: isEditMode });
  const createMutation = useCreateCatalogCategoryMutation();
  const updateMutation = useUpdateCatalogCategoryMutation(id ?? '');

  useRedirectOnNotFound(categoryQuery.error, isEditMode);

  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (!categoryQuery.data) return;

    reset({
      name: categoryQuery.data.name,
      mxik: buildMxikOption(categoryQuery.data.mxikCode, categoryQuery.data.mxikName),
      sortOrder: categoryQuery.data.sortOrder,
      isActive: categoryQuery.data.isActive,
    });
  }, [categoryQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!values.mxik) {
      return;
    }

    const payload = {
      name: values.name.trim(),
      mxikCode: values.mxik.code,
      mxikName: values.mxik.name ?? '',
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    if (isEditMode && id) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    push(RoutePath.catalogCategoryList);
  });

  if (isEditMode && categoryQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={
          isEditMode
            ? t('pages.categoryEdit.title', { defaultValue: 'Kategoriyani tahrirlash' })
            : t('pages.categoryCreate.title', { defaultValue: 'Yangi kategoriya' })
        }
        links={[
          { name: t('pages.categories.title'), href: RoutePath.catalogCategoryList },
          {
            name: isEditMode
              ? t('pages.categoryEdit.title', { defaultValue: 'Kategoriyani tahrirlash' })
              : t('pages.categoryCreate.title', { defaultValue: 'Yangi kategoriya' }),
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

            <FormActions
              isSubmitting={formState.isSubmitting}
              submitLabel={
                isEditMode
                  ? t('actions.save', { defaultValue: 'Saqlash' })
                  : t('actions.create', { defaultValue: 'Yaratish' })
              }
              onCancel={() => push(RoutePath.catalogCategoryList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default CategoryFormPage;
