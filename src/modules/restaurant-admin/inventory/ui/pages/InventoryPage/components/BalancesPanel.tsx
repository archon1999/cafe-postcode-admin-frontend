import { Alert, Box, Button, Chip, Grid, TableCell, TableRow, Typography } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { TableSearchInput } from 'shared/ui/TableSearchInput';
import { downloadBlob } from 'shared/utils/download';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime } from 'shared/utils/format-time';

import { useInventoryAccess, useInventoryCommands, useInventoryReport } from '../../../../application';
import {
  InventoryTable,
  QueryState,
  InventorySection,
  inventoryError,
  inventoryNumber,
  inventoryUnitCost,
} from '../../../shared';

export function BalancesPanel({ warehouse }: { warehouse: string }) {
  const { t } = useTranslate('inventory');
  const { canViewCost } = useInventoryAccess();
  const query = useInventoryReport('balances', { warehouse });
  const overview = useInventoryReport('overview', { warehouse });
  const { exportReport } = useInventoryCommands();
  const [search, setSearch] = useState('');
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [error, setError] = useState('');
  const balances =
    query.data?.filter(
      (row) =>
        (!onlyAlerts || row.isLow || row.isNegative) &&
        `${row.itemName} ${row.sku}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    ) || [];
  const exportFile = async () => {
    try {
      const blob = await exportReport.mutateAsync({ report: 'balances', filters: { warehouse } });
      downloadBlob(blob, 'inventory-balances.csv');
    } catch (cause) {
      setError(inventoryError(cause) || t('loadFailed'));
    }
  };
  return (
    <InventorySection
      title={t('balances.title')}
      toolbar={
        <>
          <TableSearchInput
            size="small"
            placeholder={t('search')}
            inputProps={{ 'aria-label': t('search') }}
            clearAriaLabel={t('clearSearch')}
            debounceTime={300}
            value={search}
            onChange={setSearch}
          />
          <Chip
            clickable
            color={onlyAlerts ? 'warning' : 'default'}
            label={t('balances.onlyAlerts')}
            onClick={() => setOnlyAlerts(!onlyAlerts)}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
            {t('summary.lastCountedAt')}:{' '}
            {overview.data?.lastCountedAt ? formatDateTime(overview.data.lastCountedAt) : t('neverCounted')}
          </Typography>
        </>
      }
      summary={
        <QueryState query={overview}>
          <Grid container spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
            {[
              { label: t('summary.itemCount'), value: overview.data?.itemCount },
              { label: t('summary.lowStockCount'), value: overview.data?.lowStockCount, color: 'warning.main' },
              { label: t('summary.negativeStockCount'), value: overview.data?.negativeStockCount, color: 'error.main' },
              ...(canViewCost
                ? [
                    {
                      label: t('summary.stockValue'),
                      value:
                        overview.data?.stockValue === null || overview.data?.stockValue === undefined
                          ? '—'
                          : formatMoney(Number(overview.data.stockValue)),
                    },
                  ]
                : []),
            ].map((metric) => (
              <Grid key={metric.label} size={{ xs: 6, md: canViewCost ? 3 : 4 }}>
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
                  <Typography variant="h5" color={metric.color || 'text.primary'}>
                    {metric.value ?? '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </QueryState>
      }
      footer={<Alert severity="info">{t('balances.estimateHelp')}</Alert>}
      action={
        <Button
          variant="outlined"
          disabled={exportReport.isPending}
          onClick={() => {
            void exportFile();
          }}>
          {t('export')}
        </Button>
      }>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <QueryState query={query} empty={!balances.length}>
        <InventoryTable
          headers={[
            t('fields.item'),
            t('fields.quantity'),
            t('fields.minQuantity'),
            ...(canViewCost ? [t('fields.averageCost'), t('fields.value')] : []),
            t('fields.availabilityMode'),
            t('status'),
          ]}>
          {balances.map((balance) => (
            <TableRow key={`${balance.warehouse}-${balance.item}`} hover>
              <TableCell>
                <Typography variant="subtitle2">{balance.itemName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {balance.sku}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" color={balance.isNegative ? 'error.main' : 'text.primary'}>
                  {inventoryNumber(balance.quantity)} {t(`units.${balance.baseUnit}`)}
                </Typography>
              </TableCell>
              <TableCell>
                {inventoryNumber(balance.minQuantity)} {t(`units.${balance.baseUnit}`)}
              </TableCell>
              {canViewCost && (
                <>
                  <TableCell>
                    {balance.averageCost === null || balance.averageCost === undefined
                      ? '—'
                      : inventoryUnitCost(balance.averageCost)}
                  </TableCell>
                  <TableCell>
                    {balance.value === null || balance.value === undefined ? '—' : formatMoney(Number(balance.value))}
                  </TableCell>
                </>
              )}
              <TableCell>{t(`modes.${balance.availabilityMode}`)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="soft"
                  color={balance.isNegative ? 'error' : balance.isLow ? 'warning' : 'success'}
                  label={t(
                    balance.isNegative ? 'balances.negative' : balance.isLow ? 'balances.low' : 'balances.normal',
                  )}
                />
              </TableCell>
            </TableRow>
          ))}
        </InventoryTable>
      </QueryState>
    </InventorySection>
  );
}
