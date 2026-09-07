import { Button, Chip, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';
import { TableSearchInput } from 'shared/ui/TableSearchInput';

import { useInventoryAccess, useInventoryReference } from '../../../../application';
import type { ReferenceKind, StockItem, Supplier, Warehouse } from '../../../../domain';
import { InventoryTable, QueryState, InventorySection, inventoryNumber } from '../../../shared';
import { ReferenceDialog } from '../dialogs/ReferenceDialog';

export function ReferencesPanel({ kind }: { kind: ReferenceKind }) {
  const { t } = useTranslate('inventory');
  const { canManage } = useInventoryAccess();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<{ initial?: StockItem | Supplier | Warehouse } | null>(null);
  const query = useInventoryReference(kind);
  const rows = query.data?.filter((item) => item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) ?? [];
  return (
    <InventorySection
      title={t(`references.${kind}`)}
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
        </>
      }
      action={
        canManage && (
          <Button
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setEditing({})}>
            {t(`add.${kind}`)}
          </Button>
        )
      }>
      <QueryState query={query} empty={!rows.length}>
        <InventoryTable
          headers={[
            t('fields.name'),
            ...(kind === 'items'
              ? [t('fields.baseUnit'), t('fields.purchaseUnit'), t('fields.minQuantity'), t('fields.availabilityMode')]
              : kind === 'suppliers'
                ? [t('fields.taxNumber'), t('fields.phone')]
                : [t('fields.isDefault')]),
            t('status'),
            '',
          ]}>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.name}</TableCell>
              {'baseUnit' in row && (
                <>
                  <TableCell>{t(`units.${row.baseUnit}`)}</TableCell>
                  <TableCell>
                    {row.purchaseUnit} ({inventoryNumber(row.purchaseFactor)})
                  </TableCell>
                  <TableCell>{inventoryNumber(row.minQuantity)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={row.availabilityMode === 'block' ? 'warning' : 'default'}
                      label={t(`modes.${row.availabilityMode}`)}
                    />
                  </TableCell>
                </>
              )}
              {'taxNumber' in row && (
                <>
                  <TableCell>{row.taxNumber || '—'}</TableCell>
                  <TableCell>{row.phone || '—'}</TableCell>
                </>
              )}
              {'isDefault' in row && <TableCell>{row.isDefault ? t('yes') : '—'}</TableCell>}
              <TableCell>
                <Chip
                  size="small"
                  variant="soft"
                  color={row.isActive ? 'success' : 'default'}
                  label={t(row.isActive ? 'active' : 'inactive')}
                />
              </TableCell>
              <TableCell>
                {canManage && (
                  <Tooltip title={t('edit.action')}>
                    <IconButton aria-label={t('edit.action')} onClick={() => setEditing({ initial: row })}>
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </InventoryTable>
      </QueryState>
      {editing && (
        <ReferenceDialog
          key={`${kind}-${editing.initial?.id ?? 'new'}`}
          kind={kind}
          initial={editing.initial}
          onClose={() => setEditing(null)}
        />
      )}
    </InventorySection>
  );
}
