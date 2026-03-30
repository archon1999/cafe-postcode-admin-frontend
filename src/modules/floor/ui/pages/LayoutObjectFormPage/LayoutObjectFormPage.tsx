import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form, RHFSelect, RHFTextField } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import {
  useCreateLayoutObjectMutation,
  useGetDiningTablesQuery,
  useGetFloorHallsQuery,
  useGetLayoutObjectByIdQuery,
  useGetZonesQuery,
  useUpdateLayoutObjectMutation,
} from '../../../application';
import { getLayoutObjectKindTranslationKey } from '../../lib/presenters';

const schema = z.object({
  hall: z.string().min(1),
  zone: z.string().optional(),
  table: z.string().optional(),
  kind: z.enum(['table', 'bar', 'cash_desk', 'door', 'wall', 'decor', 'label']),
  label: z.string(),
  positionX: z.coerce.number(),
  positionY: z.coerce.number(),
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  rotation: z.coerce.number(),
  sortOrder: z.coerce.number().min(0),
  payloadJson: z.string(),
});

type Values = z.infer<typeof schema>;

const OBJECT_KINDS = ['table', 'bar', 'cash_desk', 'door', 'wall', 'decor', 'label'] as const;

const LayoutObjectFormPage = () => {
  const { t } = useTranslate('floor');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);
  const query = useGetLayoutObjectByIdQuery(id ?? '', { enabled: isEditMode });
  const hallsQuery = useGetFloorHallsQuery();
  const zonesQuery = useGetZonesQuery();
  const tablesQuery = useGetDiningTablesQuery();
  const createMutation = useCreateLayoutObjectMutation();
  const updateMutation = useUpdateLayoutObjectMutation(id ?? '');

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      hall: '',
      zone: '',
      table: '',
      kind: 'label',
      label: '',
      positionX: 0,
      positionY: 0,
      width: 120,
      height: 120,
      rotation: 0,
      sortOrder: 0,
      payloadJson: '{}',
    },
  });

  const selectedHall = methods.watch('hall');
  const zoneOptions = useMemo(
    () => (zonesQuery.data ?? []).filter((zone) => !selectedHall || zone.hall === selectedHall),
    [selectedHall, zonesQuery.data],
  );
  const tableOptions = useMemo(
    () => (tablesQuery.data ?? []).filter((table) => !selectedHall || table.hall === selectedHall),
    [selectedHall, tablesQuery.data],
  );

  useEffect(() => {
    if (!query.data) return;
    methods.reset({
      hall: query.data.hall,
      zone: query.data.zone ?? '',
      table: query.data.table ?? '',
      kind: query.data.kind,
      label: query.data.label ?? '',
      positionX: Number(query.data.positionX),
      positionY: Number(query.data.positionY),
      width: Number(query.data.width),
      height: Number(query.data.height),
      rotation: Number(query.data.rotation),
      sortOrder: query.data.sortOrder,
      payloadJson: JSON.stringify(query.data.payload ?? {}, null, 2),
    });
  }, [methods, query.data]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      hall: values.hall,
      zone: values.zone || null,
      table: values.table || null,
      kind: values.kind,
      label: values.label.trim(),
      positionX: values.positionX,
      positionY: values.positionY,
      width: values.width,
      height: values.height,
      rotation: values.rotation,
      sortOrder: values.sortOrder,
      payload: values.payloadJson.trim() ? (JSON.parse(values.payloadJson) as Record<string, unknown>) : {},
    };
    if (isEditMode && id) await updateMutation.mutateAsync(payload);
    else await createMutation.mutateAsync(payload);
    push(RoutePath.floorLayoutObjectList);
  });

  if (isEditMode && query.isLoading) return <LoadingScreen />;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.layoutObjectEdit.title') : t('pages.layoutObjectCreate.title')}
        links={[
          { name: t('pages.layoutObjects.title'), href: RoutePath.floorLayoutObjectList },
          { name: isEditMode ? t('pages.layoutObjectEdit.title') : t('pages.layoutObjectCreate.title') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 3 }}>
              <RHFSelect<Values>
                name="hall"
                label={t('fields.hall')}
                helperText={hallsQuery.isLoading ? tCommon('labels.loading') : undefined}>
                {(hallsQuery.data ?? []).map((hall) => (
                  <MenuItem key={hall.id} value={hall.id}>
                    {formatHallDisplayName(hall.name)}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect<Values>
                name="zone"
                label={t('fields.zone')}
                helperText={zonesQuery.isLoading ? tCommon('labels.loading') : undefined}>
                <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                {zoneOptions.map((zone) => (
                  <MenuItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect<Values>
                name="table"
                label={t('fields.table')}
                helperText={tablesQuery.isLoading ? tCommon('labels.loading') : undefined}>
                <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                {tableOptions.map((table) => (
                  <MenuItem key={table.id} value={table.id}>
                    {table.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect<Values> name="kind" label={t('fields.kind')}>
                {OBJECT_KINDS.map((kind) => (
                  <MenuItem key={kind} value={kind}>
                    {t(getLayoutObjectKindTranslationKey(kind))}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField<Values> name="label" label={t('fields.label')} />
              <RHFTextField<Values> name="sortOrder" label={t('fields.sortOrder')} type="number" />
              <RHFTextField<Values> name="positionX" label={t('fields.positionX')} type="number" />
              <RHFTextField<Values> name="positionY" label={t('fields.positionY')} type="number" />
              <RHFTextField<Values> name="width" label={t('fields.width')} type="number" />
              <RHFTextField<Values> name="height" label={t('fields.height')} type="number" />
              <RHFTextField<Values> name="rotation" label={t('fields.rotation')} type="number" />
              <RHFTextField<Values> name="payloadJson" label={t('fields.payload')} multiline rows={8} />
            </Box>
            <FormActions
              isSubmitting={methods.formState.isSubmitting}
              submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
              onCancel={() => push(RoutePath.floorLayoutObjectList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default LayoutObjectFormPage;
