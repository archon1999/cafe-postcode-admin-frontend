import { zodResolver } from '@hookform/resolvers/zod';
import Card from '@mui/material/Card';
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
import { Form } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import {
  useCreateTableSessionMutation,
  useGetDiningTablesQuery,
  useGetFloorHallsQuery,
  useGetTableSessionByIdQuery,
  useGetUsersForFloorQuery,
  useUpdateTableSessionMutation,
} from '../../../application';

import { TableSessionFormFields } from './TableSessionFormFields';

const schema = z.object({
  hall: z.string().min(1),
  table: z.string().min(1),
  openedBy: z.string().optional(),
  assignedWaiter: z.string().optional(),
  guestCount: z.coerce.number().min(1),
  status: z.enum(['open', 'pending_payment', 'closed', 'merged']),
  note: z.string(),
});

export type Values = z.infer<typeof schema>;

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
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <TableSessionFormFields
              halls={hallsQuery.data ?? []}
              isHallsLoading={hallsQuery.isLoading}
              isTablesLoading={tablesQuery.isLoading}
              isUsersLoading={usersQuery.isLoading}
              statuses={TABLE_SESSION_STATUSES}
              t={t}
              tCommon={tCommon}
              tables={tableOptions}
              users={usersQuery.data ?? []}
            />
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
