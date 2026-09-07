import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Chip,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';
import { TableSearchInput } from 'shared/ui/TableSearchInput';
import { formatMoney } from 'shared/utils/format-money';

import { useInventoryAccess, useInventoryCommands, useInventoryReference } from '../../../../application';
import type { Recipe } from '../../../../domain';
import {
  FormDialog,
  InventoryTable,
  QueryState,
  InventorySection,
  inventoryError,
  inventoryNumber,
} from '../../../shared';
import { RecipeDialog } from '../dialogs/RecipeDialog';

export function RecipesPanel() {
  const { t } = useTranslate('inventory');
  const { canManage, canViewCost } = useInventoryAccess();
  const query = useInventoryReference('recipes');
  const { deactivateRecipe } = useInventoryCommands();
  const [editing, setEditing] = useState<{ initial?: Recipe } | null>(null);
  const [deactivating, setDeactivating] = useState<Recipe | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const rows =
    query.data?.filter((recipe) =>
      `${recipe.catalogItemName} ${recipe.name}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    ) ?? [];
  const deactivate = async () => {
    if (!deactivating) return;
    try {
      await deactivateRecipe.mutateAsync(deactivating.id);
      setDeactivating(null);
    } catch (cause) {
      setError(inventoryError(cause) || t('saveFailed'));
    }
  };
  return (
    <InventorySection
      title={t('recipes.title')}
      toolbar={
        <TableSearchInput
          size="small"
          placeholder={t('search')}
          inputProps={{ 'aria-label': t('search') }}
          clearAriaLabel={t('clearSearch')}
          debounceTime={300}
          value={search}
          onChange={setSearch}
        />
      }
      action={
        canManage && (
          <Button
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setEditing({})}>
            {t('add.recipe')}
          </Button>
        )
      }>
      <QueryState query={query} empty={!rows.length}>
        <Stack spacing={0}>
          {rows.map((recipe) => (
            <Accordion
              key={recipe.id}
              disableGutters
              elevation={0}
              sx={{ borderBottom: 1, borderColor: 'divider', borderRadius: '0 !important' }}>
              <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap" sx={{ width: 1 }}>
                  <Typography variant="subtitle1">{recipe.catalogItemName}</Typography>
                  <Chip size="small" label={t('recipes.version', { version: recipe.version })} />
                  <Chip
                    size="small"
                    color={recipe.isActive ? 'success' : 'default'}
                    label={t(recipe.isActive ? 'active' : 'inactive')}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {t(`triggers.${recipe.trigger}`)}
                  </Typography>
                  {canViewCost && recipe.estimatedCost !== null && recipe.estimatedCost !== undefined && (
                    <Typography variant="subtitle2" sx={{ ml: 'auto' }}>
                      {formatMoney(Number(recipe.estimatedCost))}
                    </Typography>
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t('fields.yieldQuantity')}: {inventoryNumber(recipe.yieldQuantity)}
                </Typography>
                <InventoryTable headers={[t('fields.item'), t('fields.grossQuantity'), t('fields.modifierOption')]}>
                  {recipe.lines.map((line, index) => (
                    <TableRow key={line.id || index}>
                      <TableCell>{line.itemName}</TableCell>
                      <TableCell>
                        {inventoryNumber(line.quantity)} {t(`units.${line.baseUnit}`)}
                      </TableCell>
                      <TableCell>{line.modifierOptionName || t('recipes.always')}</TableCell>
                    </TableRow>
                  ))}
                </InventoryTable>
                {canManage && (
                  <Stack direction="row" gap={1} sx={{ mt: 2 }}>
                    <Button onClick={() => setEditing({ initial: recipe })}>{t('recipes.newVersion')}</Button>
                    {recipe.isActive && (
                      <Button
                        color="error"
                        onClick={() => {
                          setError('');
                          setDeactivating(recipe);
                        }}>
                        {t('deactivate')}
                      </Button>
                    )}
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </QueryState>
      {editing && <RecipeDialog initial={editing.initial} onClose={() => setEditing(null)} />}
      {deactivating && (
        <FormDialog
          title={t('deactivate')}
          onClose={() => setDeactivating(null)}
          onSubmit={() => {
            void deactivate();
          }}
          pending={deactivateRecipe.isPending}
          error={error}>
          <Alert severity="warning">{t('recipes.deactivateHelp', { name: deactivating.catalogItemName })}</Alert>
        </FormDialog>
      )}
    </InventorySection>
  );
}
