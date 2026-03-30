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
  useCreateTableSessionMutation,
  useGetDiningTablesQuery,
  useGetFloorHallsQuery,
  useGetTableSessionByIdQuery,
  useGetUsersForFloorQuery,
  useUpdateTableSessionMutation,
} from '../../../application';
import { getTableSessionStatusTranslationKey } from '../../lib/presenters';

const schema = z.object({
  hall: z.string().min(1),
  table: z.string().min(1),
  openedBy: z.string().optional(),
  assignedWaiter: z.string().optional(),
  guestCount: z.coerce.number().min(1),
  status: z.enum(['open', 'pending_payment', 'closed', 'merged']),
  note: z.string(),
});

type Values = z.infer<typeof schema>;

const TABLE_SESSION_STATUSES = ['open', 'pending_payment', 'closed', 'merged'] as const;

const TableSessionFormPage = () => {
  const { t } = useTranslate('floor');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);
  const query = useGetTableSessionByIdQuery(id ?? '', { enabled: isEditMode });
  const hallsQuery = useGetFloorHallsQuery();
  const tablesQuery = useGetDiningTablesQuery();
  const usersQuery = useGetUsersForFloorQuery();
  const createMutation = useCreateTableSessionMutation();
  const updateMutation = useUpdateTableSessionMutation(id ?? '');

  useRedirectOnNotFound(query.error, isEditMode);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { hall: '', table: '', openedBy: '', assignedWaiter: '', guestCount: 1, status: 'open', note: '' },
  });

  const selectedHall = methods.watch('hall');
  const tableOptions = useMemo(
    () => (tablesQuery.data ?? []).filter((table) => !selectedHall || table.hall === selectedHall),
    [selectedHall, tablesQuery.data],
  );

  useEffect(() => {
    if (!query.data) return;
    methods.reset({
      hall: query.data.hall,
      table: query.data.table,
      openedBy: query.data.openedBy ?? '',
      assignedWaiter: query.data.assignedWaiter ?? '',
      guestCount: query.data.guestCount,
      status: query.data.status,
      note: query.data.note ?? '',
    });
  }, [methods, query.data]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      hall: values.hall,
      table: values.table,
      openedBy: values.openedBy || null,
      assignedWaiter: values.assignedWaiter || null,
      guestCount: values.guestCount,
      status: values.status,
      note: values.note.trim(),
    };
    if (isEditMode && id) await updateMutation.mutateAsync(payload);
    else await createMutation.mutateAsync(payload);
    push(RoutePath.floorTableSessionList);
  });

  if (isEditMode && query.isLoading) return <LoadingScreen />;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.tableSessionEdit.title') : t('pages.tableSessionCreate.title')}
        links={[
          { name: t('pages.tableSessions.title'), href: RoutePath.floorTableSessionList },
          { name: isEditMode ? t('pages.tableSessionEdit.title') : t('pages.tableSessionCreate.title') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
              <RHFSelect<Values>
                name="hall"
                label={t('fields.hall')}
                helperText={hallsQuery.isLoading ? tCommon('labels.loading') : undefined}>
                {(hallsQuery.data ?? []).map((hall) => (
                  <MenuItem key={hall.id} value={hall.id}>
                    {formatHallDisplayName(hall.name, hall.level, tCommon)}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect<Values>
                name="table"
                label={t('fields.table')}
                helperText={tablesQuery.isLoading ? tCommon('labels.loading') : undefined}>
                {tableOptions.map((table) => (
                  <MenuItem key={table.id} value={table.id}>
                    {table.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect<Values>
                name="openedBy"
                label={t('fields.openedBy')}
                helperText={usersQuery.isLoading ? tCommon('labels.loading') : undefined}>
                <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                {(usersQuery.data ?? []).map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.fullName || user.username}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect<Values>
                name="assignedWaiter"
                label={t('fields.assignedWaiter')}
                helperText={usersQuery.isLoading ? tCommon('labels.loading') : undefined}>
                <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                {(usersQuery.data ?? []).map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.fullName || user.username}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField<Values> name="guestCount" label={t('fields.guestCount')} type="number" />
              <RHFSelect<Values> name="status" label={t('fields.status')}>
                {TABLE_SESSION_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {t(getTableSessionStatusTranslationKey(status))}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField<Values> name="note" label={t('fields.note')} multiline rows={4} />
            </Box>
            <FormActions
              isSubmitting={methods.formState.isSubmitting}
              submitLabel={isEditMode ? t('actions.save') : t('actions.create')}
              onCancel={() => push(RoutePath.floorTableSessionList)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default TableSessionFormPage;
