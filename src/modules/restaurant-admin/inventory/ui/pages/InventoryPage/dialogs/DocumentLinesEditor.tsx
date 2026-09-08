import { Button, IconButton, MenuItem, Stack, TableCell, TableRow, TextField } from '@mui/material';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';

import type { DocumentLineInput, ManualDocumentKind, StockItem } from '../../../../domain';
import { InventoryDatePicker, InventoryTable, inventoryNumber } from '../../../shared';

export function DocumentLinesEditor({
  lines,
  items,
  kind,
  showCosts,
  lockedItems = false,
  expectedQuantities,
  onChange,
}: {
  lines: DocumentLineInput[];
  items: StockItem[];
  kind: ManualDocumentKind;
  showCosts: boolean;
  lockedItems?: boolean;
  expectedQuantities?: Record<string, string | null>;
  onChange: (lines: DocumentLineInput[]) => void;
}) {
  const { t } = useTranslate('inventory');
  const inbound = ['receipt', 'opening', 'customer_return'].includes(kind);
  const counted = kind === 'stocktake';
  const update = (index: number, values: Partial<DocumentLineInput>) =>
    onChange(lines.map((line, at) => (at === index ? { ...line, ...values } : line)));
  return (
    <Stack spacing={1}>
      <InventoryTable
        headers={[
          t('fields.item'),
          ...(counted ? [t('fields.expectedQuantity')] : []),
          t(counted ? 'fields.actualQuantity' : 'fields.quantity'),
          t('fields.inputUnit'),
          ...(inbound && showCosts ? [t('fields.unitCost')] : []),
          ...(inbound ? [t('fields.lotNumber'), t('fields.expiresOn')] : []),
          '',
        ]}>
        {lines.map((line, index) => {
          const item = items.find((candidate) => candidate.id === line.item);
          return (
            <TableRow key={index}>
              <TableCell sx={{ minWidth: 200 }}>
                <TextField
                  size="medium"
                  select
                  fullWidth
                  label={t('fields.item')}
                  value={line.item}
                  disabled={lockedItems}
                  onChange={(event) => update(index, { item: event.target.value, inputUnit: 'base' })}>
                  {items
                    .filter((candidate) => candidate.isActive || candidate.id === line.item)
                    .map((candidate) => (
                      <MenuItem key={candidate.id} value={candidate.id}>
                        {candidate.name}
                      </MenuItem>
                    ))}
                </TextField>
              </TableCell>
              {counted && (
                <TableCell>
                  {inventoryNumber(expectedQuantities?.[line.item])} {item ? t(`units.${item.baseUnit}`) : ''}
                </TableCell>
              )}
              <TableCell sx={{ minWidth: 125 }}>
                <TextField
                  size="medium"
                  type="number"
                  label={t(counted ? 'fields.actualQuantity' : 'fields.quantity')}
                  value={line.quantity ?? ''}
                  onChange={(event) => update(index, { quantity: event.target.value })}
                  slotProps={{ htmlInput: { min: counted ? 0 : 0.000001, step: 'any' } }}
                />
              </TableCell>
              <TableCell sx={{ minWidth: 150 }}>
                <TextField
                  size="medium"
                  select
                  fullWidth
                  label={t('fields.inputUnit')}
                  value={line.inputUnit}
                  disabled={counted}
                  onChange={(event) => update(index, { inputUnit: event.target.value as 'base' | 'purchase' })}>
                  <MenuItem value="base">{item ? t(`units.${item.baseUnit}`) : t('base')}</MenuItem>
                  {!counted && (
                    <MenuItem value="purchase">
                      {item?.purchaseUnit || t('purchase')} ({inventoryNumber(item?.purchaseFactor)})
                    </MenuItem>
                  )}
                </TextField>
              </TableCell>
              {inbound && showCosts && (
                <TableCell sx={{ minWidth: 140 }}>
                  <TextField
                    size="medium"
                    type="number"
                    label={t('fields.unitCost')}
                    value={line.unitCost ?? '0'}
                    onChange={(event) => update(index, { unitCost: event.target.value })}
                    slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                  />
                </TableCell>
              )}
              {inbound && (
                <>
                  <TableCell sx={{ minWidth: 130 }}>
                    <TextField
                      size="medium"
                      label={t('fields.lotNumber')}
                      value={line.lotNumber}
                      onChange={(event) => update(index, { lotNumber: event.target.value })}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 165 }}>
                    <InventoryDatePicker
                      label={t('fields.expiresOn')}
                      value={line.expiresOn ?? ''}
                      onChange={(value) => update(index, { expiresOn: value || null })}
                    />
                  </TableCell>
                </>
              )}
              <TableCell>
                {!lockedItems && (
                  <IconButton
                    color="error"
                    aria-label={t('removeLine')}
                    onClick={() => onChange(lines.filter((_, at) => at !== index))}>
                    <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </InventoryTable>
      {!lockedItems && (
        <Button
          sx={{ alignSelf: 'flex-start' }}
          onClick={() =>
            onChange([
              ...lines,
              {
                item: '',
                quantity: '',
                unitCost: showCosts ? '0' : undefined,
                inputUnit: 'base',
                lotNumber: '',
                expiresOn: null,
              },
            ])
          }>
          {t('addLine')}
        </Button>
      )}
    </Stack>
  );
}
