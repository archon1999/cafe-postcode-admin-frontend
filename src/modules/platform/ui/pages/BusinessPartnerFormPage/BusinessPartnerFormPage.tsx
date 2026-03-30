import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessBusinessPartners } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form, RHFPhoneInput, RHFTextField } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import {
  useCreateBusinessPartnerMutation,
  useGetBusinessPartnerByIdQuery,
  useUpdateBusinessPartnerMutation,
} from '../../../application';

const schema = z.object({
  inn: z.string().min(1),
  companyName: z.string().min(1),
  legalName: z.string().default(''),
  directorName: z.string().default(''),
  phone: z.string().default(''),
  email: z.string().email().or(z.literal('')).default(''),
  address: z.string().default(''),
});

type Values = z.infer<typeof schema>;

const BusinessPartnerFormPage = () => {
  const { t } = useTranslate('platform');
  const { profile } = useCurrentUser();
  const { id } = useParams<{ id: string }>();
  const { push, replace } = useRouter();
  const isEditMode = Boolean(id);
  const canManagePlatform = canAccessBusinessPartners(profile);
  const query = useGetBusinessPartnerByIdQuery(id ?? '', { enabled: isEditMode && canManagePlatform });
  const createMutation = useCreateBusinessPartnerMutation();
  const updateMutation = useUpdateBusinessPartnerMutation(id ?? '');

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      inn: '',
      companyName: '',
      legalName: '',
      directorName: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  useEffect(() => {
    if (profile && !canManagePlatform) {
      replace(RoutePath.main);
    }
  }, [canManagePlatform, profile, replace]);

  useEffect(() => {
    if (!query.data) return;

    methods.reset({
      inn: query.data.inn,
      companyName: query.data.companyName,
      legalName: query.data.legalName,
      directorName: query.data.directorName,
      phone: query.data.phone,
      email: query.data.email,
      address: query.data.address,
    });
  }, [methods, query.data]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      inn: values.inn.trim(),
      companyName: values.companyName.trim(),
      legalName: values.legalName.trim(),
      directorName: values.directorName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
    };

    if (isEditMode && id) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    push(RoutePath.platformBusinessPartnerList);
  });

  if ((isEditMode && query.isLoading) || (profile && !canManagePlatform)) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.businessPartnerEdit.title') : t('pages.businessPartnerCreate.title')}
        links={[
          { name: t('pages.businessPartners.title'), href: RoutePath.platformBusinessPartnerList },
          { name: isEditMode ? t('pages.businessPartnerEdit.title') : t('pages.businessPartnerCreate.title') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
              <RHFTextField<Values> name="inn" label={t('fields.inn')} />
              <RHFTextField<Values> name="companyName" label={t('fields.companyName')} />
              <RHFTextField<Values> name="legalName" label={t('fields.legalName')} />
              <RHFTextField<Values> name="directorName" label={t('fields.directorName')} />
              <RHFPhoneInput<Values> name="phone" label={t('fields.phone')} defaultCountry="UZ" />
              <RHFTextField<Values> name="email" label={t('fields.email')} />
              <RHFTextField<Values>
                name="address"
                label={t('fields.address')}
                multiline
                rows={3}
                sx={{ gridColumn: { lg: '1 / -1' } }}
              />
            </Box>
            <FormActions
              isSubmitting={methods.formState.isSubmitting}
              submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
              onCancel={() => push(RoutePath.platformBusinessPartnerList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default BusinessPartnerFormPage;
