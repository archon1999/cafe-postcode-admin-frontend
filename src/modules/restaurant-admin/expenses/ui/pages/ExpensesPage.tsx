import { Icon } from '@iconify/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState, type DragEvent } from 'react';
import { toast } from 'sonner';

import { useShowAllBranches } from 'app/layouts/components/branch-scope-columns';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { useCurrentUser } from 'modules/auth';
import type { AdminCashExpense, AdminExpenseCategory } from 'shared/api/admin-types';
import { useDataGridPreferences } from 'shared/hooks/use-data-grid-preferences';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FilterSelect } from 'shared/ui/Filters';
import { TableSearchInput } from 'shared/ui/TableSearchInput';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime } from 'shared/utils/format-time';

import {
  createCustomRangeState,
  createPresetRangeState,
  type ReportsDateRangeState,
  type ReportsFixedDatePreset,
} from '../../../reports/ui/components/reportsDateRange';
import { ReportsDateRangePicker } from '../../../reports/ui/components/ReportsDateRangePicker';
import {
  useCashExpensesQuery,
  useCreateExpenseCategoryMutation,
  useExpenseCategoriesQuery,
  useReorderExpenseCategoriesMutation,
  useUpdateExpenseCategoryMutation,
  useVoidExpenseMutation,
} from '../../application';

type CategoryFormState = { id?: string; name: string };
const EMPTY_EXPENSE_CATEGORIES: AdminExpenseCategory[] = [];
const EMPTY_CASH_EXPENSES: AdminCashExpense[] = [];

function ExpenseEmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 260, px: 3, py: 6, textAlign: 'center' }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          mb: 2,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: 'text.secondary',
          bgcolor: 'action.hover',
        }}>
        <Icon icon={icon} width={36} />
      </Box>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 420 }}>
        {description}
      </Typography>
    </Stack>
  );
}

const ExpensesPage = () => {
  const { t } = useTranslate('expenses');
  const { t: tCommon } = useTranslate('common');
  const { profile } = useCurrentUser();
  const showBranchColumn = useShowAllBranches();
  const { filters, setFilterField, paginationModel, setPaginationModel } = useDataGridPreferences<{
    tab: 'operations' | 'categories';
    search: string;
    statuses: string[];
    categoryIds: string[];
    dateRange: ReportsDateRangeState;
  }>('expenses', {
    filters: {
      tab: 'operations',
      search: '',
      statuses: ['posted'],
      categoryIds: [],
      dateRange: createPresetRangeState('monthToDate'),
    },
    paginationModel: { page: 0, pageSize: 10 },
    columnVisibilityModel: {},
  });
  const { tab, search, statuses, categoryIds, dateRange } = filters;
  const { page, pageSize } = paginationModel;
  const setTab = (value: 'operations' | 'categories') => setFilterField('tab', value);
  const setSearch = (value: string) => setFilterField('search', value);
  const setStatuses = (value: string[]) => setFilterField('statuses', value);
  const setCategoryIds = (value: string[]) => setFilterField('categoryIds', value);
  const setDateRange = (value: ReportsDateRangeState) => setFilterField('dateRange', value);
  const setPage = useCallback(
    (value: number) => setPaginationModel((previous) => ({ ...previous, page: value })),
    [setPaginationModel],
  );
  const setPageSize = useCallback(
    (value: number) => setPaginationModel((previous) => ({ ...previous, pageSize: value })),
    [setPaginationModel],
  );
  const [categoryForm, setCategoryForm] = useState<CategoryFormState | null>(null);
  const [orderedCategories, setOrderedCategories] = useState<AdminExpenseCategory[]>([]);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [voidExpense, setVoidExpense] = useState<{ id: string; label: string } | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const permissionCodes = profile?.permissionCodes ?? [];
  const isSuperuser = Boolean(profile?.isSuperuser);
  const canManageCategories =
    isSuperuser ||
    permissionCodes.some((code) => ['expense_categories.create', 'expense_categories.update'].includes(code));
  const canVoid = isSuperuser || permissionCodes.includes('expenses.update');

  const categoriesQuery = useExpenseCategoriesQuery();
  const expensesQuery = useCashExpensesQuery({
    page: page + 1,
    pageSize,
    search: search || undefined,
    statusIn: statuses.length ? statuses.join(',') : undefined,
    categoryIdIn: categoryIds.length ? categoryIds.join(',') : undefined,
    dateFrom: dateRange.startDate,
    dateTo: dateRange.endDate,
    ordering: '-occurred_at',
  });
  const createCategory = useCreateExpenseCategoryMutation();
  const updateCategory = useUpdateExpenseCategoryMutation();
  const reorderCategories = useReorderExpenseCategoriesMutation();
  const voidMutation = useVoidExpenseMutation();
  const categories = categoriesQuery.data ?? EMPTY_EXPENSE_CATEGORIES;
  const expenses = expensesQuery.data?.data ?? EMPTY_CASH_EXPENSES;
  const hasActiveFilters = Boolean(search || categoryIds.length || statuses.length !== 1 || statuses[0] !== 'posted');
  const postedTotal = expensesQuery.data?.postedTotal ?? 0;

  useEffect(() => {
    if (!reorderCategories.isPending) setOrderedCategories(categories);
  }, [categories, reorderCategories.isPending]);

  useEffect(() => {
    setPage(0);
  }, [categoryIds, dateRange.endDate, dateRange.startDate, search, setPage, statuses]);

  const applyDatePreset = (preset: ReportsFixedDatePreset) => {
    setDateRange(createPresetRangeState(preset));
  };

  const applyCustomDateRange = (startDate: string, endDate: string) => {
    setDateRange(createCustomRangeState(startDate, endDate));
  };

  const saveCategory = async () => {
    if (!categoryForm?.name.trim()) return;
    try {
      if (categoryForm.id) {
        const current = categories.find((category) => category.id === categoryForm.id);
        if (!current) return;
        await updateCategory.mutateAsync({
          id: current.id,
          payload: { name: categoryForm.name.trim(), sortOrder: current.sortOrder, isActive: current.isActive },
        });
      } else {
        const nextSortOrder = categories.reduce((max, category) => Math.max(max, category.sortOrder), -1) + 1;
        await createCategory.mutateAsync({ name: categoryForm.name.trim(), sortOrder: nextSortOrder, isActive: true });
      }
      toast.success(t('messages.categorySaved'));
      setCategoryForm(null);
    } catch {
      toast.error(t('messages.saveFailed'));
    }
  };

  const toggleCategory = async (category: AdminExpenseCategory) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        payload: { name: category.name, sortOrder: category.sortOrder, isActive: !category.isActive },
      });
      toast.success(t('messages.categorySaved'));
    } catch {
      toast.error(t('messages.saveFailed'));
    }
  };

  const dropCategory = async (targetId: string) => {
    const sourceId = draggedCategoryId;
    setDraggedCategoryId(null);
    if (!sourceId || sourceId === targetId) return;
    const sourceIndex = orderedCategories.findIndex((category) => category.id === sourceId);
    const targetIndex = orderedCategories.findIndex((category) => category.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const previous = orderedCategories;
    const next = [...orderedCategories];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    setOrderedCategories(next.map((category, index) => ({ ...category, sortOrder: index })));

    try {
      await reorderCategories.mutateAsync(
        next.map((category, index) => ({
          id: category.id,
          name: category.name,
          sortOrder: index,
          isActive: category.isActive,
        })),
      );
      toast.success(t('messages.orderSaved'));
    } catch {
      setOrderedCategories(previous);
      toast.error(t('messages.saveFailed'));
    }
  };

  const confirmVoid = async () => {
    if (!voidExpense || !voidReason.trim()) return;
    try {
      await voidMutation.mutateAsync({ id: voidExpense.id, reason: voidReason.trim() });
      toast.success(t('messages.expenseVoided'));
      setVoidExpense(null);
      setVoidReason('');
    } catch {
      toast.error(t('messages.voidFailed'));
    }
  };

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('title')}
        action={
          tab === 'categories' && canManageCategories ? (
            <Button
              variant="contained"
              color="black"
              startIcon={<Icon icon="mingcute:add-line" />}
              onClick={() => setCategoryForm({ name: '' })}>
              {t('actions.addCategory')}
            </Button>
          ) : undefined
        }
      />
      <ListPageBody>
        <Stack spacing={2.5} sx={{ flex: 1, minHeight: 0 }}>
          <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              gap={1.5}
              sx={{ px: 2, py: { xs: 1.5, md: 1 } }}>
              <Tabs value={tab} onChange={(_, value) => setTab(value)}>
                <Tab value="operations" label={t('tabs.operations')} />
                <Tab value="categories" label={t('tabs.categories')} />
              </Tabs>
              <Stack direction="row" alignItems="stretch">
                <Box
                  sx={{
                    minWidth: { xs: 0, sm: 180 },
                    flex: { xs: 1, sm: 'none' },
                    px: { xs: 1.5, sm: 2.5 },
                    py: 0.5,
                    textAlign: 'center',
                  }}>
                  <Typography variant="h6" sx={{ lineHeight: 1.25, fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(postedTotal)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {t('summary.postedTotal')}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    minWidth: { xs: 0, sm: 120 },
                    flex: { xs: 1, sm: 'none' },
                    px: { xs: 1.5, sm: 2.5 },
                    py: 0.5,
                    borderLeft: 1,
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}>
                  <Typography variant="h6" sx={{ lineHeight: 1.25, fontVariantNumeric: 'tabular-nums' }}>
                    {expensesQuery.data?.total ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {t('summary.records')}
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            {tab === 'operations' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2 }}>
                  <TableSearchInput
                    size="small"
                    label={t('filters.search')}
                    placeholder={t('filters.searchPlaceholder')}
                    value={search}
                    onChange={setSearch}
                    onClear={() => setSearch('')}
                    fullWidth
                    sx={{ minWidth: { md: 260 } }}
                  />
                  <FilterSelect
                    label={t('fields.status')}
                    value={statuses}
                    options={[
                      { value: 'posted', label: t('statuses.posted') },
                      { value: 'voided', label: t('statuses.voided') },
                    ]}
                    onChange={setStatuses}
                    onApply={setStatuses}
                    emptyLabel={t('filters.all')}
                    sx={{ minWidth: 210 }}
                  />
                  <FilterSelect
                    label={t('fields.category')}
                    value={categoryIds}
                    options={categories.map((category) => ({ value: category.id, label: category.name }))}
                    onChange={setCategoryIds}
                    onApply={setCategoryIds}
                    emptyLabel={t('filters.all')}
                    sx={{ minWidth: 240 }}
                  />
                  <ReportsDateRangePicker
                    activePreset={dateRange.activePreset}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onPresetChange={applyDatePreset}
                    onRangeChange={applyCustomDateRange}
                  />
                </Stack>
                {expensesQuery.isError ? (
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Alert severity="error">{t('messages.loadFailed')}</Alert>
                  </Box>
                ) : null}
                <TableContainer sx={{ flex: 1, minHeight: 0, borderTop: 1, borderColor: 'divider' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('fields.date')}</TableCell>
                        {showBranchColumn ? <TableCell>{tCommon('scope.branch')}</TableCell> : null}
                        <TableCell>{t('fields.amount')}</TableCell>
                        <TableCell>{t('fields.category')}</TableCell>
                        <TableCell>{t('fields.comment')}</TableCell>
                        <TableCell>{t('fields.recipient')}</TableCell>
                        <TableCell>{t('fields.createdBy')}</TableCell>
                        <TableCell>{t('fields.cashDesk')}</TableCell>
                        <TableCell>{t('fields.status')}</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id} hover>
                          <TableCell>{formatDateTime(expense.occurredAt)}</TableCell>
                          {showBranchColumn ? <TableCell>{expense.restaurantName || '-'}</TableCell> : null}
                          <TableCell>
                            <Typography variant="subtitle2">{formatMoney(expense.amount)}</Typography>
                          </TableCell>
                          <TableCell>{expense.categoryName}</TableCell>
                          <TableCell>{expense.comment || '—'}</TableCell>
                          <TableCell>{expense.recipientName || '—'}</TableCell>
                          <TableCell>{expense.createdByName}</TableCell>
                          <TableCell>{expense.cashDeskName}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="soft"
                              color={expense.status === 'posted' ? 'success' : 'default'}
                              label={t(`statuses.${expense.status}`)}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {canVoid && expense.status === 'posted' ? (
                              <Tooltip title={t('actions.void')}>
                                <IconButton
                                  color="error"
                                  aria-label={t('actions.void')}
                                  onClick={() =>
                                    setVoidExpense({ id: expense.id, label: expense.comment || expense.categoryName })
                                  }>
                                  <Icon icon="solar:trash-bin-trash-bold-duotone" width={20} />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!expensesQuery.isLoading && expenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={showBranchColumn ? 10 : 9} sx={{ p: 0 }}>
                            <ExpenseEmptyState
                              icon="solar:wallet-money-bold-duotone"
                              title={hasActiveFilters ? t('empty.operationsFilteredTitle') : t('empty.operationsTitle')}
                              description={
                                hasActiveFilters
                                  ? t('empty.operationsFilteredDescription')
                                  : t('empty.operationsDescription')
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={expensesQuery.data?.total ?? 0}
                  page={page}
                  rowsPerPage={pageSize}
                  rowsPerPageOptions={[10, 25, 50]}
                  onPageChange={(_, nextPage) => setPage(nextPage)}
                  onRowsPerPageChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(0);
                  }}
                  labelRowsPerPage={t('pagination.rowsPerPage')}
                  labelDisplayedRows={({ from, to, count }) => t('pagination.displayed', { from, to, count })}
                  sx={{ borderTop: 1, borderColor: 'divider' }}
                />
              </Box>
            ) : (
              <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
                {!categoriesQuery.isLoading && orderedCategories.length === 0 ? (
                  <ExpenseEmptyState
                    icon="solar:folder-open-bold-duotone"
                    title={t('empty.categoriesTitle')}
                    description={t('empty.categoriesDescription')}
                  />
                ) : null}
                {orderedCategories.map((category) => (
                  <Stack
                    key={category.id}
                    draggable={canManageCategories}
                    onDragStart={(event: DragEvent<HTMLDivElement>) => {
                      setDraggedCategoryId(category.id);
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', category.id);
                    }}
                    onDragOver={(event) => {
                      if (canManageCategories) event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      void dropCategory(category.id);
                    }}
                    onDragEnd={() => setDraggedCategoryId(null)}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: draggedCategoryId === category.id ? 'text.primary' : 'divider',
                      borderRadius: 2,
                      opacity: draggedCategoryId === category.id ? 0.55 : 1,
                      transition: 'border-color 120ms ease, opacity 120ms ease',
                    }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {canManageCategories ? (
                        <Box
                          sx={{ display: 'grid', color: 'text.disabled', cursor: 'grab' }}
                          aria-label={t('categories.dragHandle')}>
                          <Icon icon="custom:drag-dots-fill" width={24} />
                        </Box>
                      ) : null}
                      <Typography variant="subtitle1">{category.name}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={category.isActive ? t('statuses.active') : t('statuses.inactive')}>
                        <Switch
                          size="small"
                          checked={category.isActive}
                          disabled={!canManageCategories || updateCategory.isPending}
                          slotProps={{
                            input: {
                              'aria-label': category.isActive ? t('statuses.active') : t('statuses.inactive'),
                            },
                          }}
                          onChange={() => void toggleCategory(category)}
                        />
                      </Tooltip>
                      {canManageCategories ? (
                        <Tooltip title={t('actions.edit')}>
                          <IconButton
                            aria-label={t('actions.edit')}
                            onClick={() => setCategoryForm({ id: category.id, name: category.name })}>
                            <Icon icon="solar:pen-new-square-bold-duotone" width={20} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      {canManageCategories && category.isActive ? (
                        <Tooltip title={t('actions.deactivate')}>
                          <IconButton
                            color="error"
                            aria-label={t('actions.deactivate')}
                            disabled={updateCategory.isPending}
                            onClick={() => void toggleCategory(category)}>
                            <Icon icon="solar:trash-bin-trash-bold-duotone" width={20} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}
          </Card>
        </Stack>
      </ListPageBody>

      <Dialog open={Boolean(categoryForm)} onClose={() => setCategoryForm(null)} fullWidth maxWidth="xs">
        <DialogTitle>{categoryForm?.id ? t('dialogs.editCategory') : t('dialogs.addCategory')}</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <TextField
            autoFocus
            fullWidth
            label={t('fields.name')}
            value={categoryForm?.name ?? ''}
            onChange={(event) => setCategoryForm((value) => (value ? { ...value, name: event.target.value } : value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryForm(null)}>{t('actions.cancel')}</Button>
          <Button
            variant="contained"
            disabled={!categoryForm?.name.trim() || createCategory.isPending || updateCategory.isPending}
            onClick={() => void saveCategory()}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(voidExpense)} onClose={() => setVoidExpense(null)} fullWidth maxWidth="xs">
        <DialogTitle>{t('dialogs.voidExpense')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning">{voidExpense?.label}</Alert>
            <TextField
              autoFocus
              multiline
              minRows={3}
              label={t('fields.voidReason')}
              value={voidReason}
              onChange={(event) => setVoidReason(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoidExpense(null)}>{t('actions.cancel')}</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!voidReason.trim() || voidMutation.isPending}
            onClick={() => void confirmVoid()}>
            {t('actions.void')}
          </Button>
        </DialogActions>
      </Dialog>
    </ListPageContent>
  );
};

export default ExpensesPage;
