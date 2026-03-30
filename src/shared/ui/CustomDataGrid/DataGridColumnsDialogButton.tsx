import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { useGridApiContext } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { ViewColumnsIcon } from 'app/theme/core/components/mui-x-data-grid';
import { Iconify } from 'shared/ui/Iconify';

import type { ToolbarButtonBaseProps } from './ToolbarCore';
import { ToolbarButtonBase } from './ToolbarCore';

type ColumnOption = {
  field: string;
  label: string;
  hideable: boolean;
};

type Props = {
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel?: GridColumnVisibilityModel;
  onSave: (nextModel: GridColumnVisibilityModel) => void;
  showLabel?: boolean;
  buttonLabel?: string;
  dialogTitle?: string;
  saveLabel?: string;
  closeLabel?: string;
  excludeFields?: string[];
  buttonTestId?: string;
  dialogTestId?: string;
  searchInputTestId?: string;
  showHideAllTestId?: string;
  resetTestId?: string;
  closeTestId?: string;
  saveTestId?: string;
  buttonProps?: Omit<ToolbarButtonBaseProps, 'icon' | 'label' | 'onClick' | 'showLabel'>;
};

const DEFAULT_SAVE_LABEL = 'Save';
const DEFAULT_CLOSE_LABEL = 'Close';
const DEFAULT_BUTTON_TEST_ID = 'data-grid-columns-dialog-button';
const DEFAULT_DIALOG_TEST_ID = 'data-grid-columns-dialog';
const DEFAULT_SEARCH_INPUT_TEST_ID = 'data-grid-columns-dialog-search-input';
const DEFAULT_SHOW_HIDE_ALL_TEST_ID = 'data-grid-columns-dialog-show-hide-all';
const DEFAULT_RESET_TEST_ID = 'data-grid-columns-dialog-reset';
const DEFAULT_CLOSE_TEST_ID = 'data-grid-columns-dialog-close';
const DEFAULT_SAVE_TEST_ID = 'data-grid-columns-dialog-save';
const DEFAULT_BUTTON_PROPS: Omit<ToolbarButtonBaseProps, 'icon' | 'label' | 'onClick' | 'showLabel'> = {
  variant: 'soft',
  color: 'inherit',
  sx: { py: '6px', px: '12px' },
};

export function DataGridColumnsDialogButton({
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSave,
  showLabel,
  buttonLabel,
  dialogTitle,
  saveLabel = DEFAULT_SAVE_LABEL,
  closeLabel = DEFAULT_CLOSE_LABEL,
  excludeFields,
  buttonTestId = DEFAULT_BUTTON_TEST_ID,
  dialogTestId = DEFAULT_DIALOG_TEST_ID,
  searchInputTestId = DEFAULT_SEARCH_INPUT_TEST_ID,
  showHideAllTestId = DEFAULT_SHOW_HIDE_ALL_TEST_ID,
  resetTestId = DEFAULT_RESET_TEST_ID,
  closeTestId = DEFAULT_CLOSE_TEST_ID,
  saveTestId = DEFAULT_SAVE_TEST_ID,
  buttonProps = DEFAULT_BUTTON_PROPS,
}: Props) {
  const apiRef = useGridApiContext();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [draftModel, setDraftModel] = useState<GridColumnVisibilityModel>(columnVisibilityModel);

  const labels = useMemo(
    () => ({
      button: buttonLabel ?? String(apiRef.current.getLocaleText('toolbarColumns')),
      title: dialogTitle ?? buttonLabel ?? String(apiRef.current.getLocaleText('toolbarColumns')),
      search: String(apiRef.current.getLocaleText('columnsManagementSearchTitle')),
      noColumns: String(apiRef.current.getLocaleText('columnsManagementNoColumns')),
      showHideAll: String(apiRef.current.getLocaleText('columnsManagementShowHideAllText')),
      reset: String(apiRef.current.getLocaleText('columnsManagementReset')),
    }),
    [apiRef, buttonLabel, dialogTitle],
  );

  const columnOptions = useMemo<ColumnOption[]>(() => {
    const excluded = new Set([...(excludeFields ?? []), '__check__']);

    return columns.reduce<ColumnOption[]>((acc, column) => {
      if (excluded.has(column.field)) {
        return acc;
      }

      if (column.field === 'actions' || column.type === 'actions') {
        return acc;
      }

      let label: string | undefined;

      if (typeof column.headerName === 'string') {
        label = column.headerName.trim();
      } else if (typeof column.headerName === 'number') {
        label = String(column.headerName);
      }

      if (!label) {
        label = column.field;
      }

      if (!label.trim()) {
        return acc;
      }

      acc.push({
        field: column.field,
        label,
        hideable: column.hideable !== false,
      });

      return acc;
    }, []);
  }, [columns, excludeFields]);

  const togglableFields = useMemo(
    () => columnOptions.filter((column) => column.hideable).map((column) => column.field),
    [columnOptions],
  );

  const filteredOptions = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return columnOptions;
    }

    return columnOptions.filter(
      (column) => column.label.toLowerCase().includes(query) || column.field.toLowerCase().includes(query),
    );
  }, [columnOptions, searchValue]);

  const handleOpen = useCallback(() => {
    setDraftModel(columnVisibilityModel);
    setSearchValue('');
    setOpen(true);
  }, [columnVisibilityModel]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearchValue('');
    setDraftModel(columnVisibilityModel);
  }, [columnVisibilityModel]);

  const handleToggleColumn = useCallback((field: string) => {
    setDraftModel((prev) => ({
      ...prev,
      [field]: !(prev[field] ?? true),
    }));
  }, []);

  const handleShowHideAll = useCallback(() => {
    setDraftModel((prev) => {
      const areAllVisible = togglableFields.every((field) => prev[field] !== false);
      const nextValue = !areAllVisible;
      const next = { ...prev };

      togglableFields.forEach((field) => {
        next[field] = nextValue;
      });

      return next;
    });
  }, [togglableFields]);

  const handleReset = useCallback(() => {
    setDraftModel((prev) => {
      const next = { ...prev };

      togglableFields.forEach((field) => {
        const defaultValue = defaultColumnVisibilityModel?.[field];
        next[field] = defaultValue ?? true;
      });

      return next;
    });
  }, [defaultColumnVisibilityModel, togglableFields]);

  const handleSave = useCallback(() => {
    onSave(draftModel);
    setOpen(false);
  }, [draftModel, onSave]);

  return (
    <>
      <ToolbarButtonBase
        onClick={handleOpen}
        label={labels.button}
        icon={<ViewColumnsIcon />}
        showLabel={showLabel}
        data-testid={buttonTestId}
        {...buttonProps}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" data-testid={dialogTestId}>
        <DialogTitle>{labels.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              size="small"
              label={labels.search}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              inputProps={{ 'data-testid': searchInputTestId }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={18} />
                  </InputAdornment>
                ),
              }}
            />

            {filteredOptions.length > 0 ? (
              <Stack spacing={0.5}>
                {filteredOptions.map((option) => {
                  const checked = draftModel[option.field] ?? true;
                  return (
                    <FormControlLabel
                      key={option.field}
                      disabled={!option.hideable}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => handleToggleColumn(option.field)}
                          disabled={!option.hideable}
                        />
                      }
                      label={option.label}
                    />
                  );
                })}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {labels.noColumns}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="text"
            color="inherit"
            onClick={handleShowHideAll}
            disabled={togglableFields.length === 0}
            data-testid={showHideAllTestId}>
            {labels.showHideAll}
          </Button>
          <Button
            variant="text"
            color="inherit"
            onClick={handleReset}
            disabled={togglableFields.length === 0}
            data-testid={resetTestId}>
            {labels.reset}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" color="inherit" onClick={handleClose} data-testid={closeTestId}>
            {closeLabel}
          </Button>
          <Button variant="contained" onClick={handleSave} data-testid={saveTestId}>
            {saveLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
