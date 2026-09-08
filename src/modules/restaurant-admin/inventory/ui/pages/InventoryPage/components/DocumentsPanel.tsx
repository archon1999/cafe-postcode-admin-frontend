import { Alert, Button, Chip, Link, MenuItem, Stack, TableCell, TableRow, TextField } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { Iconify } from 'shared/ui/Iconify';
import { TableSearchInput } from 'shared/ui/TableSearchInput';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime } from 'shared/utils/format-time';

import { useInventoryAccess, useInventoryCommands, useInventoryReport } from '../../../../application';
import type { InventoryDocument } from '../../../../domain';
import { InventoryTable, QueryState, InventorySection, inventoryError } from '../../../shared';
import { DocumentDetailDialog } from '../dialogs/DocumentDetailDialog';
import { DocumentDialog } from '../dialogs/DocumentDialog';

const PAGE_SIZE = 25;
export function DocumentsPanel({ warehouse }: { warehouse: string }) {
  const { t } = useTranslate('inventory');
  const { profile } = useCurrentUser();
  const { canManage, canViewCost } = useInventoryAccess();
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ initial?: InventoryDocument; freshCount?: boolean } | null>(null);
  const [error, setError] = useState('');
  const [countKey, setCountKey] = useState(() => crypto.randomUUID());
  const query = useInventoryReport('documents', {
    warehouse,
    kind,
    status,
    search,
    limit: PAGE_SIZE + 1,
    offset: page * PAGE_SIZE,
  });
  const balances = useInventoryReport('balances', { warehouse }, canManage);
  const { saveDocument } = useInventoryCommands();
  const startCount = async () => {
    if (!balances.data?.length) {
      setError(t('stocktake.noItems'));
      return;
    }
    try {
      const initial = await saveDocument.mutateAsync({
        payload: {
          kind: 'stocktake',
          warehouse,
          supplier: null,
          reference: `COUNT-${new Date().toISOString().slice(0, 10)}`,
          reason: '',
          occurredAt: new Date().toISOString(),
          attachmentUrl: '',
          responsibleName: profile?.fullName || '',
          notes: '',
          idempotencyKey: countKey,
          lines: balances.data.map((balance) => ({
            item: balance.item,
            quantity: null,
            inputUnit: 'base',
            lotNumber: '',
            expiresOn: null,
          })),
        },
      });
      setEditor({ initial, freshCount: true });
      setCountKey(crypto.randomUUID());
    } catch (cause) {
      setError(inventoryError(cause) || t('saveFailed'));
    }
  };
  return (
    <InventorySection
      title={t('documents.title')}
      toolbar={
        <>
          <TableSearchInput
            size="medium"
            placeholder={t('search')}
            inputProps={{ 'aria-label': t('search') }}
            clearAriaLabel={t('clearSearch')}
            debounceTime={300}
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(0);
            }}
          />
          <TextField
            size="medium"
            select
            label={t('fields.kind')}
            value={kind}
            sx={{ minWidth: 190 }}
            onChange={(event) => {
              setKind(event.target.value);
              setPage(0);
            }}>
            <MenuItem value="">{t('all')}</MenuItem>
            {[
              'receipt',
              'opening',
              'issue',
              'supplier_return',
              'customer_return',
              'stocktake',
              'sale',
              'sale_return',
              'reversal',
            ].map((value) => (
              <MenuItem key={value} value={value}>
                {t(`kinds.${value}`)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="medium"
            select
            label={t('status')}
            value={status}
            sx={{ minWidth: 150 }}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}>
            <MenuItem value="">{t('all')}</MenuItem>
            {['draft', 'posted', 'reversed'].map((value) => (
              <MenuItem key={value} value={value}>
                {t(`statuses.${value}`)}
              </MenuItem>
            ))}
          </TextField>
        </>
      }
      footer={
        <Stack direction="row" justifyContent="flex-end" gap={1}>
          <Button disabled={page === 0 || query.isFetching} onClick={() => setPage((value) => value - 1)}>
            {t('previous')}
          </Button>
          <Button
            disabled={(query.data?.length ?? 0) <= PAGE_SIZE || query.isFetching}
            onClick={() => setPage((value) => value + 1)}>
            {t('next')}
          </Button>
        </Stack>
      }
      action={
        canManage && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              disabled={saveDocument.isPending || balances.isLoading || balances.isError}
              onClick={() => {
                void startCount();
              }}>
              {t('stocktake.start')}
            </Button>
            <Button
              variant="contained"
              color="black"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => setEditor({})}>
              {t('add.document')}
            </Button>
          </Stack>
        )
      }>
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <QueryState query={query} empty={!query.data?.length}>
        <InventoryTable
          headers={[
            t('document'),
            t('fields.occurredAt'),
            t('fields.kind'),
            t('fields.supplier'),
            t('status'),
            ...(canViewCost ? [t('fields.totalValue')] : []),
            t('fields.responsibleName'),
          ]}>
          {query.data?.slice(0, PAGE_SIZE).map((document) => (
            <TableRow key={document.id} hover>
              <TableCell>
                <Link component="button" color="inherit" underline="hover" onClick={() => setDetail(document.id)}>
                  {document.number}
                </Link>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(document.occurredAt)}</TableCell>
              <TableCell>{t(`kinds.${document.kind}`)}</TableCell>
              <TableCell>{document.supplierName || '—'}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="soft"
                  color={
                    document.status === 'posted' ? 'success' : document.status === 'reversed' ? 'error' : 'default'
                  }
                  label={t(`statuses.${document.status}`)}
                />
              </TableCell>
              {canViewCost && (
                <TableCell>
                  {document.totalValue === null || document.totalValue === undefined
                    ? '—'
                    : formatMoney(Number(document.totalValue))}
                </TableCell>
              )}
              <TableCell>{document.responsibleName || document.createdByName}</TableCell>
            </TableRow>
          ))}
        </InventoryTable>
      </QueryState>

      {detail && (
        <DocumentDetailDialog
          id={detail}
          onClose={() => setDetail(null)}
          onEdit={(initial) => {
            setDetail(null);
            setEditor({ initial });
          }}
        />
      )}
      {editor && (
        <DocumentDialog
          warehouse={warehouse}
          initial={editor.initial}
          freshCount={editor.freshCount}
          onClose={() => setEditor(null)}
          onSaved={(id) => {
            setEditor(null);
            setDetail(id);
          }}
        />
      )}
    </InventorySection>
  );
}
