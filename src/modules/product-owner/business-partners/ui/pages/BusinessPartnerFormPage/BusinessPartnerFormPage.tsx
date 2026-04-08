import { zodResolver } from '@hookform/resolvers/zod';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessBusinessPartners } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { normalizeError, notifyError } from 'shared/api/errors/errorHandling';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { usePageTitle } from 'shared/hooks/use-page-title';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import {
  useCreateBusinessPartnerMutation,
  useGetBusinessPartnerByIdQuery,
  useLookupBusinessPartnerMutation,
  useUpdateBusinessPartnerMutation,
} from '../../../application';

import { BusinessPartnerFormFields } from './BusinessPartnerFormFields';

const schema = z.object({
  inn: z.string().min(1),
  companyName: z.string().min(1),
  legalName: z.string().default(''),
  directorName: z.string().default(''),
  phone: z.string().default(''),
  email: z.string().email().or(z.literal('')).default(''),
  address: z.string().default(''),
  fakturaPayload: z.record(z.string(), z.unknown()).optional(),
});

export type Values = z.infer<typeof schema>;

const BusinessPartnerFormPage = () => {
  const { t } = useTranslate('platform');
  const { profile } = useCurrentUser();
  const { id } = useParams() as { id?: string };
  const { push, replace } = useRouter();
  const isEditMode = Boolean(id);
  const canManagePlatform = canAccessBusinessPartners(profile);
  const query = useGetBusinessPartnerByIdQuery(id ?? '', { enabled: isEditMode && canManagePlatform });
  const createMutation = useCreateBusinessPartnerMutation();
  const lookupMutation = useLookupBusinessPartnerMutation();
  const updateMutation = useUpdateBusinessPartnerMutation(id ?? '');
  const listTitle = t('pages.businessPartners.title');
  const editTitle = t('pages.businessPartnerEdit.title');
  const createTitle = t('pages.businessPartnerCreate.title');
  const entityTitle = query.data?.companyName || query.data?.legalName;

  useRedirectOnNotFound(query.error, isEditMode);
  usePageTitle(isEditMode ? (entityTitle ? [listTitle, entityTitle, editTitle] : [listTitle, editTitle]) : [listTitle, createTitle]);

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
      fakturaPayload: {},
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
      fakturaPayload: query.data.fakturaPayload ?? {},
    });
  }, [methods, query.data]);

  const handleLookup = async () => {
    const inn = methods.getValues('inn').trim();

    if (!inn) {
      methods.setError('inn', { type: 'manual', message: 'INN is required.' });
      return;
    }

    methods.clearErrors('inn');

    try {
      const result = await lookupMutation.mutateAsync(inn);

      methods.setValue('inn', result.inn, { shouldDirty: true, shouldValidate: true });
      methods.setValue('companyName', result.companyName, { shouldDirty: true, shouldValidate: true });
      methods.setValue('legalName', result.legalName, { shouldDirty: true, shouldValidate: true });
      methods.setValue('directorName', result.directorName, { shouldDirty: true, shouldValidate: true });
      methods.setValue('phone', result.phone, { shouldDirty: true, shouldValidate: true });
      methods.setValue('email', result.email, { shouldDirty: true, shouldValidate: true });
      methods.setValue('address', result.address, { shouldDirty: true, shouldValidate: true });
      methods.setValue('fakturaPayload', result.fakturaPayload, { shouldDirty: true });
    } catch (error) {
      const normalizedError = normalizeError(error);
      methods.setError('inn', {
        type: 'manual',
        message: normalizedError.message,
      });
      notifyError(normalizedError);
    }
  };

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      inn: values.inn.trim(),
      companyName: values.companyName.trim(),
      legalName: values.legalName.trim(),
      directorName: values.directorName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
      fakturaPayload: values.fakturaPayload,
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
        heading={isEditMode ? editTitle : createTitle}
        links={[
          { name: listTitle, href: RoutePath.platformBusinessPartnerList },
          { name: isEditMode ? editTitle : createTitle },
        ]}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <BusinessPartnerFormFields
              isEditMode={isEditMode}
              isLookupPending={lookupMutation.isPending}
              isSubmitting={methods.formState.isSubmitting}
              onLookup={handleLookup}
              t={t}
            />
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
