import { Alert, Box, Button, Card, Chip, Divider, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';
import { formatMoney } from 'shared/utils/format-money';

import { useInventoryAccess, useInventoryRecipes } from '../../../../application';
import type { CatalogOption, Recipe } from '../../../../domain';
import { QueryState, inventoryNumber } from '../../../shared';
import { RecipeDialog } from '../dialogs/RecipeDialog';

type Props = {
  catalogItem: CatalogOption;
  salePrice?: number;
};

export function CatalogRecipePanel({ catalogItem, salePrice }: Props) {
  const { t } = useTranslate('inventory');
  const { canManage, canViewCost } = useInventoryAccess();
  const query = useInventoryRecipes(catalogItem.id);
  const [editing, setEditing] = useState<{ initial?: Recipe } | null>(null);
  const active = query.data?.find((recipe) => recipe.isActive) ?? query.data?.[0];
  const estimatedCost = Number(active?.estimatedCost ?? 0);
  const hasMargin = canViewCost && Boolean(active) && Number(salePrice) > 0;

  return (
    <Card sx={{ boxShadow: (theme) => theme.customShadows.card }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        gap={2}
        sx={{ p: 3 }}>
        <Box>
          <Typography variant="h6">{t('catalogRecipe.title')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('catalogRecipe.description')}
          </Typography>
        </Box>
        {canManage && (
          <Button
            variant="contained"
            color="black"
            startIcon={<Iconify icon={active ? 'solar:refresh-bold' : 'mingcute:add-line'} />}
            onClick={() => setEditing({ initial: active })}>
            {t(active ? 'recipes.update' : 'catalogRecipe.create')}
          </Button>
        )}
      </Stack>
      <Divider />
      <Box sx={{ p: 3 }}>
        <QueryState query={query}>
          {!active ? (
            <Alert severity="info">{t('catalogRecipe.empty')}</Alert>
          ) : (
            <Stack spacing={2.5}>
              <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography variant="subtitle1">{active.name || active.catalogItemName}</Typography>
                <Chip size="small" color="success" label={t('active')} />
                <Chip size="small" variant="outlined" label={t(`triggers.${active.trigger}`)} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('fields.yieldQuantity')}
                  </Typography>
                  <Typography variant="subtitle2">{inventoryNumber(active.yieldQuantity)}</Typography>
                </Box>
                {canViewCost && active.estimatedCost !== null && active.estimatedCost !== undefined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('catalogRecipe.estimatedCost')}
                    </Typography>
                    <Typography variant="subtitle2">{formatMoney(Number(active.estimatedCost))}</Typography>
                  </Box>
                )}
                {hasMargin && (
                  <>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('catalogRecipe.salePrice')}
                      </Typography>
                      <Typography variant="subtitle2">{formatMoney(Number(salePrice))}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('catalogRecipe.grossMargin')}
                      </Typography>
                      <Typography variant="subtitle2">{formatMoney(Number(salePrice) - estimatedCost)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('catalogRecipe.foodCostPercent')}
                      </Typography>
                      <Typography variant="subtitle2">
                        {((estimatedCost / Number(salePrice)) * 100).toLocaleString(undefined, {
                          maximumFractionDigits: 1,
                        })}
                        %
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
              <Divider />
              <Stack spacing={1.25}>
                {active.lines.map((line) => (
                  <Stack
                    key={line.id || `${line.item}-${line.modifierOption ?? 'always'}`}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={2}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap>
                        {line.itemName}
                      </Typography>
                      {line.modifierOptionName && (
                        <Typography variant="caption" color="text.secondary">
                          {line.modifierOptionName} ·{' '}
                          {t(
                            line.modifierCondition === 'not_selected'
                              ? 'recipes.whenNotSelected'
                              : 'recipes.whenSelected',
                          )}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
                      {inventoryNumber(line.quantity)} {t(`units.${line.baseUnit || 'g'}`)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}
        </QueryState>
      </Box>
      {editing && <RecipeDialog initial={editing.initial} catalogItem={catalogItem} onClose={() => setEditing(null)} />}
    </Card>
  );
}
