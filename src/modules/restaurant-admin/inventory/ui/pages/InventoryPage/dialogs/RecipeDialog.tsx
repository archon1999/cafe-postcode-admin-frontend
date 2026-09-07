import { Alert, Button, IconButton, MenuItem, Stack, TableCell, TableRow, TextField } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';

import { useInventoryCommands, useInventoryReference } from '../../../../application';
import { validateRecipe, type Recipe, type RecipeInput } from '../../../../domain';
import { FormDialog, InventoryTable, QueryState, inventoryError } from '../../../shared';

export function RecipeDialog({ initial, onClose }: { initial?: Recipe; onClose: () => void }) {
  const { t } = useTranslate('inventory');
  const items = useInventoryReference('items');
  const catalog = useInventoryReference('catalogOptions');
  const { saveRecipe } = useInventoryCommands();
  const [error, setError] = useState('');
  const [form, setForm] = useState<RecipeInput>(() => ({
    catalogItem: initial?.catalogItem || '',
    name: initial?.name || '',
    yieldQuantity: initial?.yieldQuantity || '1',
    trigger: initial?.trigger || 'dispatch',
    lines: initial?.lines.map((line) => ({
      item: line.item,
      quantity: line.quantity,
      modifierOption: line.modifierOption,
    })) || [{ item: '', quantity: '', modifierOption: null }],
  }));
  const selected = catalog.data?.find((item) => item.id === form.catalogItem);
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
      title={t(initial ? 'recipes.newVersion' : 'add.recipe')}
      wide
      onClose={onClose}
      onSubmit={() => {
        void save();
      }}
      pending={saveRecipe.isPending || catalog.isLoading || items.isLoading}
      error={error}>
      <Alert severity="info">{t('recipes.help')}</Alert>
      <QueryState query={catalog}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            fullWidth
            select
            label={t('fields.catalogItem')}
            value={form.catalogItem}
            disabled={Boolean(initial)}
            onChange={(event) =>
              setForm({
                ...form,
                catalogItem: event.target.value,
                lines: form.lines.map((line) => ({ ...line, modifierOption: null })),
              })
            }>
            {catalog.data?.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label={t('fields.name')}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <TextField
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
          headers={[t('fields.item'), t('fields.grossQuantity'), t('fields.baseUnit'), t('fields.modifierOption'), '']}>
          {form.lines.map((line, index) => (
            <TableRow key={index}>
              <TableCell sx={{ minWidth: 200 }}>
                <TextField
                  select
                  size="small"
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
                  size="small"
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
              <TableCell sx={{ minWidth: 210 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={t('fields.modifierOption')}
                  value={line.modifierOption || ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      lines: form.lines.map((value, at) =>
                        at === index ? { ...value, modifierOption: event.target.value || null } : value,
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
              </TableCell>
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
            setForm({ ...form, lines: [...form.lines, { item: '', quantity: '', modifierOption: null }] })
          }>
          {t('addLine')}
        </Button>
      </QueryState>
    </FormDialog>
  );
}
