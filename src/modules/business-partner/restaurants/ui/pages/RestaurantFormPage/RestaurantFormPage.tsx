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
import type { AdminRestaurantPayload } from 'shared/api/admin-types';
import { normalizeError, notifyError } from 'shared/api/errors/errorHandling';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
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

import { RestaurantFormFields } from './RestaurantFormFields';

const schema = z.object({
  name: z.string().min(1),
  legalName: z.string(),
  taxNumber: z.string(),
  phone: z.string(),
  social: z.string(),
  address: z.string(),
  fakturaPayload: z.record(z.string(), z.unknown()).optional(),
  posAuthBackgroundImage: z.custom<File | string | null | undefined>().optional(),
  clearPosAuthBackgroundImage: z.boolean().optional(),
  serviceFeeEnabled: z.boolean(),
  serviceFeePercent: z.coerce.number().min(0).max(99),
  vatEnabled: z.boolean(),
  vatPercent: z.coerce.number().min(0).max(99),
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
  const lookupMutation = useLookupRestaurantMutation();
  const updateMutation = useUpdateRestaurantMutation(id ?? '');

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      legalName: '',
      taxNumber: '',
      phone: '',
      social: '',
      address: '',
      fakturaPayload: {},
      posAuthBackgroundImage: null,
      clearPosAuthBackgroundImage: false,
      serviceFeeEnabled: false,
      serviceFeePercent: 0,
      vatEnabled: false,
      vatPercent: 12,
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
      social: query.data.social ?? '',
      address: query.data.address,
      fakturaPayload: query.data.fakturaPayload ?? {},
      posAuthBackgroundImage: query.data.posAuthBackgroundImageUrl ?? null,
      clearPosAuthBackgroundImage: false,
      serviceFeeEnabled: query.data.serviceFeeEnabled,
      serviceFeePercent: Number(query.data.serviceFeePercent ?? 0),
      vatEnabled: query.data.vatEnabled,
      vatPercent: Number(query.data.vatPercent ?? 12),
      isActive: query.data.isActive,
    });
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
    const payload: AdminRestaurantPayload = {
      name: values.name.trim(),
      legalName: values.legalName.trim(),
      taxNumber: values.taxNumber.trim(),
      phone: values.phone.trim(),
      social: values.social.trim(),
      address: values.address.trim(),
      fakturaPayload: values.fakturaPayload,
      serviceFeeEnabled: values.serviceFeeEnabled,
      serviceFeePercent: values.serviceFeePercent,
      vatEnabled: values.vatEnabled,
      vatPercent: values.vatPercent,
      isActive: isEditMode ? values.isActive : false,
    };

    if (values.posAuthBackgroundImage instanceof File) {
      payload.posAuthBackgroundImage = values.posAuthBackgroundImage;
    } else if (values.clearPosAuthBackgroundImage === true) {
      payload.clearPosAuthBackgroundImage = true;
    }

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
            <RestaurantFormFields
              isEditMode={isEditMode}
              isLookupPending={lookupMutation.isPending}
              isSubmitting={methods.formState.isSubmitting}
              onLookup={handleLookup}
              t={t}
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
