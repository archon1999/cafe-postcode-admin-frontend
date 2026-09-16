import {
  Autocomplete,
  createFilterOptions,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';

import { useInventoryCommands, useInventoryReference } from '../../../../application';
import { validateRecipe, type CatalogOption, type Recipe, type RecipeInput } from '../../../../domain';
import { FormDialog, InventoryTable, QueryState, inventoryError, inventoryInputValue } from '../../../shared';

export function RecipeDialog({
  initial,
  catalogItem,
  targetType,
  onClose,
}: {
  initial?: Recipe;
  catalogItem?: CatalogOption;
  targetType?: Recipe['targetType'];
  onClose: () => void;
}) {
  const { t } = useTranslate('inventory');
  const items = useInventoryReference('items');
  const catalog = useInventoryReference('catalogOptions');
  const { saveRecipe } = useInventoryCommands();
  const resolvedTargetType = initial?.targetType || (catalogItem ? 'catalog' : targetType || 'catalog');
  const [error, setError] = useState('');
  const [form, setForm] = useState<RecipeInput>(() => ({
    catalogItem: initial?.catalogItem || catalogItem?.id || '',
    outputItem: initial?.outputItem || null,
    name: initial?.name || '',
    yieldQuantity: inventoryInputValue(initial?.yieldQuantity || '1'),
    trigger: initial?.trigger || 'dispatch',
    lines: initial?.lines.map((line) => ({
      item: line.item,
      quantity: inventoryInputValue(line.quantity),
      modifierOption: line.modifierOption,
      modifierCondition: line.modifierCondition ?? 'selected',
    })) || [{ item: '', quantity: '', modifierOption: null }],
  }));
  const options = [...(catalog.data || [])].sort(
    (a, b) =>
      (a.categoryName || t('uncategorized')).localeCompare(b.categoryName || t('uncategorized')) ||
      a.name.localeCompare(b.name),
  );
  const selected = catalog.data?.find((item) => item.id === form.catalogItem) || catalogItem;
  const save = async () => {
    const invalid = validateRecipe(form);
    if (invalid) {
      setError(t(invalid));
      return;
    }
    try {
      await saveRecipe.mutateAsync(form);
      onClose();
    } catch (cause) {
      setError(inventoryError(cause) || t('saveFailed'));
    }
  };
  return (
    <FormDialog
      title={t(initial ? 'recipes.update' : 'add.recipe')}
      help={t('recipes.help')}
      wide
      fullScreen
      onClose={onClose}
      onSubmit={() => {
        void save();
      }}
      pending={saveRecipe.isPending || catalog.isLoading || items.isLoading}
      error={error}>
      <QueryState query={resolvedTargetType === 'catalog' ? catalog : items}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          {resolvedTargetType === 'catalog' ? (
            <Autocomplete
              fullWidth
              size="medium"
              options={catalogItem ? [catalogItem] : options}
              value={selected || null}
              disabled={Boolean(initial || catalogItem)}
              getOptionKey={(option) => option.id}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              groupBy={(option) => option.categoryName || t('uncategorized')}
              filterOptions={createFilterOptions<CatalogOption>({
                stringify: (option) => `${option.name} ${option.categoryName || t('uncategorized')}`,
              })}
              noOptionsText={t('empty.title')}
              onChange={(_, option) =>
                setForm({
                  ...form,
                  catalogItem: option?.id || '',
                  outputItem: null,
                  lines: form.lines.map((line) => ({
                    ...line,
                    modifierOption: null,
                    modifierCondition: 'selected',
                  })),
                })
              }
              renderInput={(params) => <TextField {...params} size="medium" required label={t('fields.catalogItem')} />}
            />
          ) : (
            <TextField
              select
              fullWidth
              required
              size="medium"
              disabled={Boolean(initial)}
              label={t('fields.outputItem')}
              value={form.outputItem || ''}
              onChange={(event) => setForm({ ...form, catalogItem: null, outputItem: event.target.value || null })}>
              <MenuItem value="">{t('notSelected')}</MenuItem>
              {items.data
                ?.filter(
                  (item) =>
                    item.isActive &&
                    ['semi_finished', 'finished'].includes(item.kind) &&
                    (item.id === form.outputItem || !form.lines.some((line) => line.item === item.id)),
                )
                .map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
            </TextField>
          )}
          <TextField
            size="medium"
            fullWidth
            label={t('fields.name')}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <TextField
            size="medium"
            type="number"
            required
            fullWidth
            label={t('fields.yieldQuantity')}
            value={form.yieldQuantity}
            onChange={(event) => setForm({ ...form, yieldQuantity: event.target.value })}
            slotProps={{ htmlInput: { min: 0.000001, step: 'any' } }}
          />
        </Stack>
      </QueryState>
      <TextField
        size="medium"
        select
        label={t('fields.trigger')}
        value={form.trigger}
        helperText={t('recipes.triggerHelp')}
        onChange={(event) => setForm({ ...form, trigger: event.target.value as Recipe['trigger'] })}>
        <MenuItem value="dispatch">{t('triggers.dispatch')}</MenuItem>
        <MenuItem value="sale">{t('triggers.sale')}</MenuItem>
      </TextField>
      <QueryState query={items}>
        <InventoryTable
          headers={[
            t('fields.item'),
            t('fields.grossQuantity'),
            t('fields.baseUnit'),
            ...(resolvedTargetType === 'catalog' ? [t('fields.modifierOption')] : []),
            '',
          ]}>
          {form.lines.map((line, index) => (
            <TableRow key={index}>
              <TableCell sx={{ minWidth: 200 }}>
                <TextField
                  select
                  size="medium"
                  fullWidth
                  label={t('fields.item')}
                  value={line.item}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      lines: form.lines.map((value, at) =>
                        at === index ? { ...value, item: event.target.value } : value,
                      ),
                    })
                  }>
                  {items.data
                    ?.filter((item) => item.isActive || item.id === line.item)
                    .map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                </TextField>
              </TableCell>
              <TableCell sx={{ minWidth: 150 }}>
                <TextField
                  size="medium"
                  type="number"
                  required
                  label={t('fields.grossQuantity')}
                  value={line.quantity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      lines: form.lines.map((value, at) =>
                        at === index ? { ...value, quantity: event.target.value } : value,
                      ),
                    })
                  }
                  slotProps={{ htmlInput: { min: 0.000001, step: 'any' } }}
                />
              </TableCell>
              <TableCell>{t(`units.${items.data?.find((item) => item.id === line.item)?.baseUnit || 'g'}`)}</TableCell>
              {resolvedTargetType === 'catalog' && (
                <TableCell sx={{ minWidth: 210 }}>
                  <Stack spacing={1}>
                    <TextField
                      select
                      fullWidth
                      size="medium"
                      label={t('fields.modifierOption')}
                      value={line.modifierOption || ''}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          lines: form.lines.map((value, at) =>
                            at === index
                              ? {
                                  ...value,
                                  modifierOption: event.target.value || null,
                                  modifierCondition: event.target.value
                                    ? (value.modifierCondition ?? 'selected')
                                    : 'selected',
                                }
                              : value,
                          ),
                        })
                      }>
                      <MenuItem value="">{t('recipes.always')}</MenuItem>
                      {selected?.modifierOptions.map((modifier) => (
                        <MenuItem key={modifier.id} value={modifier.id}>
                          {modifier.groupName} · {modifier.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    {line.modifierOption && (
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t('fields.modifierCondition')}
                        value={line.modifierCondition ?? 'selected'}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            lines: form.lines.map((value, at) =>
                              at === index
                                ? {
                                    ...value,
                                    modifierCondition: event.target.value as 'selected' | 'not_selected',
                                  }
                                : value,
                            ),
                          })
                        }>
                        <MenuItem value="selected">{t('recipes.whenSelected')}</MenuItem>
                        <MenuItem value="not_selected">{t('recipes.whenNotSelected')}</MenuItem>
                      </TextField>
                    )}
                  </Stack>
                </TableCell>
              )}
              <TableCell>
                <IconButton
                  color="error"
                  aria-label={t('removeLine')}
                  onClick={() => setForm({ ...form, lines: form.lines.filter((_, at) => at !== index) })}>
                  <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </InventoryTable>
        <Button
          onClick={() =>
            setForm({
              ...form,
              lines: [...form.lines, { item: '', quantity: '', modifierOption: null, modifierCondition: 'selected' }],
            })
          }>
          {t('addLine')}
        </Button>
      </QueryState>
    </FormDialog>
  );
}
