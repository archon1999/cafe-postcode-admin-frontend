import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import type { AdminLayoutTemplate } from 'shared/api/admin-types';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useDeleteLayoutTemplateMutation, useGetLayoutTemplatesListQuery } from '../../../application';
import { FloorGridToolbar } from '../../components/FloorGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

const LayoutTemplatesListPage = () => {
  const { t, currentLang } = useTranslate('floor');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.floorLayoutTemplateCreate);
  const deleteMutation = useDeleteLayoutTemplateMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [defaults, setDefaults] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [templateToDelete, setTemplateToDelete] = useState<AdminLayoutTemplate | null>(null);
  const query = useGetLayoutTemplatesListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    isDefault: defaults.length === 1 ? defaults[0] === 'default' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const defaultOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'default', label: t('labels.defaultTemplate') },
      { value: 'regular', label: t('labels.regularTemplate') },
    ],
    [t],
  );

  const hasActiveFilters = Boolean(search || defaults.length);

  const columns = useMemo<GridColDef<AdminLayoutTemplate>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 220, flex: 0.9 },
      { field: 'description', headerName: t('fields.description'), minWidth: 260, flex: 1.2 },
      {
        field: 'isDefault',
        headerName: t('fields.default'),
        minWidth: 140,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isDefault ? t('labels.defaultTemplate') : t('labels.regularTemplate')}
            variant="soft"
            color={row.isDefault ? 'info' : 'default'}
          />
        ),
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: t('actions.title'),
        minWidth: 90,
        getActions: (params) => [
          <CustomGridActionsCellItem
            actionKind="edit"
            key="edit"
            label={t('actions.edit')}
            icon={<Iconify icon="solar:pen-bold" />}
            href={RouterPathHelper.floorLayoutTemplateEdit(params.row.id)}
          />,
          <CustomGridActionsCellItem
            actionKind="delete"
            key="delete"
            label={t('actions.delete')}
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => setTemplateToDelete(params.row)}
          />,
        ],
      },
    ],
    [t],
  );

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.layoutTemplates.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.floorLayoutTemplateCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createLayoutTemplate')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <ListPageBody>
        <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            checkboxSelection
            rows={query.data?.data ?? []}
            columns={columns}
            rowCount={query.data?.total ?? 0}
            loading={query.isLoading}
            localeText={localeText}
            rowHeight={64}
            pageSizeOptions={[10, 20, 50]}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={setSelectedRows}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            disableRowSelectionOnClick
            disableColumnFilter
            disableColumnMenu
            slots={{
              noRowsOverlay: () => (
                <DataGridEmptyState
                  hasActiveFilters={hasActiveFilters}
                  noData={{
                    title: t('empty.layoutTemplates.noData.title'),
                    description: t('empty.layoutTemplates.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.layoutTemplates.noResults.title'),
                    description: t('empty.layoutTemplates.noResults.description'),
                  }}
                />
              ),
              noResultsOverlay: () => (
                <DataGridEmptyState
                  forceFiltered
                  noData={{
                    title: t('empty.layoutTemplates.noData.title'),
                    description: t('empty.layoutTemplates.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.layoutTemplates.noResults.title'),
                    description: t('empty.layoutTemplates.noResults.description'),
                  }}
                />
              ),
              toolbar: () => (
                <FloorGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={t('filters.searchLayoutTemplatesPlaceholder')}
                  clearSearchLabel={t('filters.clearSearch')}
                  search={search}
                  onSearchChange={setSearch}
                  onClearSearch={() => setSearch('')}
                  filters={[
                    {
                      label: t('filters.default'),
                      value: defaults,
                      options: defaultOptions,
                      onChange: setDefaults,
                      onApply: (values) => {
                        setDefaults(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'layout-templates-default-filter',
                      emptyLabel: t('filters.all'),
                    },
                  ]}
                  columns={columns}
                  columnVisibilityModel={columnVisibilityModel}
                  defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
                  onSave={setColumnVisibilityModel}
                />
              ),
            }}
            sx={{
              border: 'none',
              [`& .${gridClasses.cell}`]: { display: 'flex', alignItems: 'center' },
              '& .MuiDataGrid-toolbarContainer': { px: 2.5, py: 2 },
            }}
          />
        </Card>
      </ListPageBody>
      <ConfirmDialog
        open={Boolean(templateToDelete)}
        onClose={() => setTemplateToDelete(null)}
        title={t('dialogs.deleteLayoutTemplate.title')}
        content={t('dialogs.deleteLayoutTemplate.description', { name: templateToDelete?.name ?? '' })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteMutation.isPending}
            onClick={async () => {
              if (!templateToDelete) return;
              await deleteMutation.mutateAsync(templateToDelete.id);
              setTemplateToDelete(null);
            }}>
            {t('actions.delete')}
          </Button>
        }
      />
    </ListPageContent>
  );
};

export default LayoutTemplatesListPage;
