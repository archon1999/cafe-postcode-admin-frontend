import { zodResolver } from '@hookform/resolvers/zod';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant, canAccessRestaurants } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import {
  useCreateRestaurantMutation,
  useGetRestaurantByIdQuery,
  useUpdateRestaurantMutation,
} from '../../../application';

import { RestaurantFormFields } from './RestaurantFormFields';

const schema = z.object({
  name: z.string().min(1),
  legalName: z.string(),
  taxNumber: z.string(),
  phone: z.string(),
  address: z.string(),
  isActive: z.boolean(),
});

export type Values = z.infer<typeof schema>;

const RestaurantFormPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const { id } = useParams<{ id: string }>();
  const { push, replace } = useRouter();
  const isEditMode = Boolean(id);
  const canManageRestaurants = canAccessRestaurants(profile);
  const canManageMyRestaurant = canAccessMyRestaurant(profile) && profile?.restaurantId === id;
  const canAccessRestaurantForm = canManageRestaurants || canManageMyRestaurant;
  const backPath = canManageRestaurants ? RoutePath.organizationRestaurantList : RoutePath.organizationMyRestaurant;
  const query = useGetRestaurantByIdQuery(id ?? '', { enabled: isEditMode && canAccessRestaurantForm });
  const createMutation = useCreateRestaurantMutation();
  const updateMutation = useUpdateRestaurantMutation(id ?? '');

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      legalName: '',
      taxNumber: '',
      phone: '',
      address: '',
      isActive: false,
    },
  });

  useEffect(() => {
    if (profile && !canAccessRestaurantForm) {
      replace(RoutePath.main);
    }
  }, [canAccessRestaurantForm, profile, replace]);

  useEffect(() => {
    if (!query.data) return;
    methods.reset({
      name: query.data.name,
      legalName: query.data.legalName,
      taxNumber: query.data.taxNumber,
      phone: query.data.phone,
      address: query.data.address,
      isActive: query.data.isActive,
    });
  }, [methods, query.data]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      legalName: values.legalName.trim(),
      taxNumber: values.taxNumber.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      isActive: isEditMode ? values.isActive : false,
    };

    if (isEditMode && id) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    push(RoutePath.organizationRestaurantList);
  });

  if ((isEditMode && query.isLoading) || (profile && !canAccessRestaurantForm)) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.restaurantEdit.title') : t('pages.restaurantCreate.title')}
        links={[
          {
            name: canManageRestaurants ? t('pages.restaurants.title') : t('pages.myRestaurant.title'),
            href: backPath,
          },
          { name: isEditMode ? t('pages.restaurantEdit.title') : t('pages.restaurantCreate.title') },
        ]}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <RestaurantFormFields isEditMode={isEditMode} t={t} />
            <FormActions
              isSubmitting={methods.formState.isSubmitting}
              submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
              onCancel={() => push(backPath)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default RestaurantFormPage;

