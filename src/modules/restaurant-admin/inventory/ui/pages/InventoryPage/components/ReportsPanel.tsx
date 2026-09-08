import {
  Alert,
  Button,
  Chip,
  Link,
  MenuItem,
  Stack,
  Tab,
  TableCell,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import dayjs, { getCurrentTashkentTime } from 'shared/utils/dayjs';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime } from 'shared/utils/format-time';

import { useInventoryAccess, useInventoryReference, useInventoryReport } from '../../../../application';
import { InventoryDatePicker, InventoryTable, QueryState, InventorySection, inventoryNumber } from '../../../shared';
import { DocumentDetailDialog } from '../dialogs/DocumentDetailDialog';

const PAGE_SIZE = 25;
export function ReportsPanel({ warehouse }: { warehouse: string }) {
  const { t } = useTranslate('inventory');
  const { canViewCost } = useInventoryAccess();
  const [tab, setTab] = useState<'movements' | 'variance'>('movements');
  const [from, setFrom] = useState(() => getCurrentTashkentTime().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(() => getCurrentTashkentTime().format('YYYY-MM-DD'));
  const [item, setItem] = useState('');
  const [page, setPage] = useState(0);
  const [document, setDocument] = useState<string | null>(null);
  const filters = { warehouse, from, to, item };
  const dateValid = (!from || dayjs(from).isValid()) && (!to || dayjs(to).isValid()) && (!from || !to || from <= to);
  const movements = useInventoryReport(
    'movements',
    { ...filters, offset: page * PAGE_SIZE, limit: PAGE_SIZE + 1 },
    tab === 'movements' && dateValid,
  );
  const variance = useInventoryReport('variance', { warehouse, from, to }, tab === 'variance' && dateValid);
  const overview = useInventoryReport('overview', { warehouse, from, to }, dateValid);
  const items = useInventoryReference('items');
  return (
    <InventorySection
      title={t('reports.title')}
      help={tab === 'variance' ? t('reports.varianceHelp') : undefined}
      toolbar={
        <>
          <InventoryDatePicker
            label={t('from')}
            value={from}
            onChange={(value) => {
              setFrom(value);
              setPage(0);
            }}
          />
          <InventoryDatePicker
            label={t('to')}
            value={to}
            error={!dateValid}
            onChange={(value) => {
              setTo(value);
              setPage(0);
            }}
          />
          {tab === 'movements' && (
            <TextField
              size="medium"
              select
              label={t('fields.item')}
              value={item}
              sx={{ minWidth: 220 }}
              onChange={(event) => {
                setItem(event.target.value);
                setPage(0);
              }}>
              <MenuItem value="">{t('all')}</MenuItem>
              {items.data?.map((value) => (
                <MenuItem key={value.id} value={value.id}>
                  {value.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </>
      }
      footer={
        tab === 'movements' &&
        dateValid && (
          <Stack direction="row" justifyContent="flex-end" gap={1}>
            <Button disabled={page === 0 || movements.isFetching} onClick={() => setPage((value) => value - 1)}>
              {t('previous')}
            </Button>
            <Button
              disabled={(movements.data?.length ?? 0) <= PAGE_SIZE || movements.isFetching}
              onClick={() => setPage((value) => value + 1)}>
              {t('next')}
            </Button>
          </Stack>
        )
      }>
      {!dateValid && <Alert severity="warning">{t('validation.dateRange')}</Alert>}
      {canViewCost && dateValid && (
        <QueryState query={overview}>
          <Stack direction="row" flexWrap="wrap" gap={2} sx={{ px: 2.5, py: 1.5 }}>
            {(['receiptValue', 'issueValue', 'saleCost', 'varianceValue'] as const).map((key) => (
              <Typography key={key} variant="body2">
                {t(`summary.${key}`)}:{' '}
                <strong>
                  {overview.data?.[key] === null || overview.data?.[key] === undefined
                    ? '—'
                    : formatMoney(Number(overview.data[key]))}
                </strong>
              </Typography>
            ))}
          </Stack>
        </QueryState>
      )}
      <Tabs
        value={tab}
        onChange={(_, value) => {
          setTab(value);
          setPage(0);
        }}
        sx={{ px: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="movements" label={t('reports.movements')} />
        <Tab value="variance" label={t('reports.variance')} />
      </Tabs>
      {dateValid &&
        (tab === 'movements' ? (
          <QueryState query={movements} empty={!movements.data?.length}>
            <InventoryTable
              headers={[
                t('document'),
                t('fields.occurredAt'),
                t('fields.item'),
                t('fields.kind'),
                t('fields.quantity'),
                t('fields.balanceAfter'),
                ...(canViewCost ? [t('fields.value')] : []),
              ]}>
              {movements.data?.slice(0, PAGE_SIZE).map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Link
                      component="button"
                      color="inherit"
                      underline="hover"
                      onClick={() => setDocument(row.document)}>
                      {row.documentNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDateTime(row.occurredAt)}</TableCell>
                  <TableCell>{row.itemName}</TableCell>
                  <TableCell>{t(`kinds.${row.kind}`)}</TableCell>
                  <TableCell sx={{ color: Number(row.quantity) < 0 ? 'error.main' : 'success.main' }}>
                    {inventoryNumber(row.quantity)} {t(`units.${row.baseUnit}`)}
                  </TableCell>
                  <TableCell>{inventoryNumber(row.balanceAfter)}</TableCell>
                  {canViewCost && (
                    <TableCell>
                      {row.value === null || row.value === undefined ? '—' : formatMoney(Number(row.value))}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </InventoryTable>
          </QueryState>
        ) : (
          <>
            <QueryState query={variance} empty={!variance.data?.length}>
              <InventoryTable
                headers={[
                  t('document'),
                  t('fields.item'),
                  t('fields.expectedQuantity'),
                  t('fields.actualQuantity'),
                  t('fields.varianceQuantity'),
                  t('fields.variancePercent'),
                  ...(canViewCost ? [t('fields.varianceValue')] : []),
                  t('status'),
                ]}>
                {variance.data?.map((row) => (
                  <TableRow key={`${row.document}-${row.item}`} hover>
                    <TableCell>
                      <Link
                        component="button"
                        color="inherit"
                        underline="hover"
                        onClick={() => setDocument(row.document)}>
                        {row.documentNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {row.itemName} ({t(`units.${row.baseUnit}`)})
                    </TableCell>
                    <TableCell>{inventoryNumber(row.expectedQuantity)}</TableCell>
                    <TableCell>{inventoryNumber(row.actualQuantity)}</TableCell>
                    <TableCell>{inventoryNumber(row.varianceQuantity)}</TableCell>
                    <TableCell>
                      {row.variancePercent === null || row.variancePercent === undefined
                        ? t('noConsumption')
                        : `${inventoryNumber(row.variancePercent)}%`}
                    </TableCell>
                    {canViewCost && (
                      <TableCell>
                        {row.varianceValue === null || row.varianceValue === undefined
                          ? '—'
                          : formatMoney(Number(row.varianceValue))}
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        size="small"
                        variant="soft"
                        color={row.requiresAttention ? 'warning' : 'success'}
                        label={t(row.requiresAttention ? 'attention' : 'withinTolerance')}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </InventoryTable>
            </QueryState>
          </>
        ))}
      {document && <DocumentDetailDialog id={document} onClose={() => setDocument(null)} />}
    </InventorySection>
  );
}
