import { zodResolver } from '@hookform/resolvers/zod';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant, canAccessRestaurants } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { normalizeError, notifyError } from 'shared/api/errors/errorHandling';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import {
  useCreateRestaurantMutation,
  useGetRestaurantByIdQuery,
  useLookupRestaurantMutation,
  useUpdateRestaurantMutation,
} from '../../../application';

import {
  restaurantFormDefaultValues,
  restaurantFormSchema,
  restaurantFormValuesToPayload,
  restaurantToFormValues,
  type RestaurantFormInput,
  type RestaurantFormValues,
} from './restaurant-form';
import { RestaurantFormFields } from './RestaurantFormFields';

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
  const lookupMutation = useLookupRestaurantMutation();
  const updateMutation = useUpdateRestaurantMutation(id ?? '');

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<RestaurantFormInput, unknown, RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: restaurantFormDefaultValues,
  });

  useEffect(() => {
    if (profile && !canAccessRestaurantForm) {
      replace(RoutePath.main);
    }
  }, [canAccessRestaurantForm, profile, replace]);

  useEffect(() => {
    if (!query.data) return;
    methods.reset(restaurantToFormValues(query.data));
  }, [methods, query.data]);

  const handleLookup = async () => {
    const taxNumber = methods.getValues('taxNumber').trim();

    if (!taxNumber) {
      methods.setError('taxNumber', { type: 'manual', message: 'Tax number is required.' });
      return;
    }

    methods.clearErrors('taxNumber');

    try {
      const result = await lookupMutation.mutateAsync(taxNumber);

      methods.setValue('taxNumber', result.taxNumber, { shouldDirty: true, shouldValidate: true });
      methods.setValue('name', result.name, { shouldDirty: true, shouldValidate: true });
      methods.setValue('legalName', result.legalName, { shouldDirty: true, shouldValidate: true });
      methods.setValue('phone', result.phone, { shouldDirty: true, shouldValidate: true });
      methods.setValue('address', result.address, { shouldDirty: true, shouldValidate: true });
      methods.setValue('fakturaPayload', result.fakturaPayload, { shouldDirty: true });
    } catch (error) {
      const normalizedError = normalizeError(error);
      methods.setError('taxNumber', {
        type: 'manual',
        message: normalizedError.message,
      });
      notifyError(normalizedError);
    }
  };

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = restaurantFormValuesToPayload(values, { isEditMode });

    if (isEditMode && id) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    push(backPath);
  });

  if ((isEditMode && query.isLoading) || (profile && !canAccessRestaurantForm)) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.restaurantEdit.title') : t('pages.restaurantCreate.title')}
        action={isEditMode ? <BackToListButton href={backPath} /> : undefined}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <RestaurantFormFields
              isEditMode={isEditMode}
              isLookupPending={lookupMutation.isPending}
              isSubmitting={methods.formState.isSubmitting}
              onLookup={handleLookup}
              t={t}
              hideStatus
            />
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
