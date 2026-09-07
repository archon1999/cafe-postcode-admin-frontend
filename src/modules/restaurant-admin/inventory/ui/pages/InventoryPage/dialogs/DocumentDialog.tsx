import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';

import { useInventoryAccess, useInventoryCommands, useInventoryReference } from '../../../../application';
import {
  validateDocument,
  type DocumentInput,
  type InventoryDocument,
  type ManualDocumentKind,
} from '../../../../domain';
import { QueryState, inventoryError, localDateTime } from '../../../shared';

import { DocumentLinesEditor } from './DocumentLinesEditor';

export function DocumentDialog({
  warehouse,
  initial,
  freshCount = false,
  onClose,
  onSaved,
}: {
  warehouse: string;
  initial?: InventoryDocument;
  freshCount?: boolean;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { t } = useTranslate('inventory');
  const { profile } = useCurrentUser();
  const { canViewCost, canPost } = useInventoryAccess();
  const items = useInventoryReference('items');
  const suppliers = useInventoryReference('suppliers');
  const commands = useInventoryCommands();
  const [savedId, setSavedId] = useState(initial?.id);
  const [form, setForm] = useState<DocumentInput>(() => ({
    kind: (initial?.kind as ManualDocumentKind) || 'receipt',
    warehouse: initial?.warehouse || warehouse,
    supplier: initial?.supplier || null,
    reference: initial?.reference || '',
    reason: initial?.reason || '',
    occurredAt: initial?.occurredAt || new Date().toISOString(),
    attachmentUrl: initial?.attachmentUrl || '',
    responsibleName: initial?.responsibleName || profile?.fullName || '',
    notes: initial?.notes || '',
    idempotencyKey: crypto.randomUUID(),
    lines: initial?.lines.map((line) => ({
      item: line.item,
      quantity: freshCount ? '' : line.quantity,
      unitCost: canViewCost ? (line.unitCost ?? '0') : undefined,
      inputUnit: line.inputUnit,
      lotNumber: line.lotNumber,
      expiresOn: line.expiresOn,
    })) || [
      {
        item: '',
        quantity: '',
        unitCost: canViewCost ? '0' : undefined,
        inputUnit: 'base',
        lotNumber: '',
        expiresOn: null,
      },
    ],
  }));
  const [date, setDate] = useState(() => localDateTime(initial ? new Date(initial.occurredAt) : undefined));
  const [error, setError] = useState('');
  const pending =
    commands.saveDocument.isPending || commands.postDocument.isPending || commands.uploadAttachment.isPending;
  const save = async (posting: boolean) => {
    const input = {
      ...form,
      occurredAt: date && Number.isFinite(Date.parse(date)) ? new Date(date).toISOString() : '',
      lines: form.lines.map((line) => ({
        ...line,
        quantity: form.kind === 'stocktake' && line.quantity === '' ? null : line.quantity,
      })),
    };
    const validation = validateDocument(input, posting);
    if (validation) {
      setError(t(validation));
      return;
    }
    setError('');
    try {
      const saved = await commands.saveDocument.mutateAsync({ id: savedId, payload: input });
      setSavedId(saved.id);
      if (posting) await commands.postDocument.mutateAsync(saved.id);
      onSaved(saved.id);
    } catch (cause) {
      setError(inventoryError(cause) || t('saveFailed'));
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    try {
      const uploaded = await commands.uploadAttachment.mutateAsync(file);
      setForm((current) => ({ ...current, attachmentUrl: uploaded.url }));
    } catch (cause) {
      setError(inventoryError(cause) || t('saveFailed'));
    }
  };
  return (
    <Dialog open fullWidth maxWidth="lg" onClose={pending ? undefined : onClose}>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          void save(false);
        }}>
        <DialogTitle>{initial ? `${t('edit.document')} · ${initial.number}` : t('add.document')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {form.kind === 'stocktake' && <Alert severity="info">{t('stocktake.help')}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                fullWidth
                label={t('fields.kind')}
                value={form.kind}
                disabled={Boolean(initial)}
                onChange={(event) => setForm({ ...form, kind: event.target.value as ManualDocumentKind })}>
                {[
                  'receipt',
                  'opening',
                  'issue',
                  'supplier_return',
                  'customer_return',
                  ...(initial?.kind === 'stocktake' ? ['stocktake'] : []),
                ].map((kind) => (
                  <MenuItem key={kind} value={kind}>
                    {t(`kinds.${kind}`)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="datetime-local"
                fullWidth
                label={t('fields.occurredAt')}
                value={date}
                required
                onChange={(event) => setDate(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              {['receipt', 'supplier_return'].includes(form.kind) && (
                <TextField
                  select
                  fullWidth
                  label={t('fields.supplier')}
                  value={form.supplier || ''}
                  onChange={(event) => setForm({ ...form, supplier: event.target.value || null })}>
                  <MenuItem value="">{t('notSelected')}</MenuItem>
                  {suppliers.data
                    ?.filter((supplier) => supplier.isActive || supplier.id === form.supplier)
                    .map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label={t('fields.reference')}
                value={form.reference}
                onChange={(event) => setForm({ ...form, reference: event.target.value })}
              />
              <TextField
                fullWidth
                label={t('fields.responsibleName')}
                value={form.responsibleName}
                onChange={(event) => setForm({ ...form, responsibleName: event.target.value })}
              />
              <TextField
                fullWidth
                label={t('fields.reason')}
                value={form.reason}
                onChange={(event) => setForm({ ...form, reason: event.target.value })}
              />
            </Stack>
            <QueryState query={items}>
              <DocumentLinesEditor
                kind={form.kind}
                lines={form.lines}
                items={items.data || []}
                showCosts={canViewCost}
                lockedItems={initial?.kind === 'stocktake'}
                expectedQuantities={Object.fromEntries(
                  initial?.lines.map((line) => [line.item, line.expectedQuantity]) || [],
                )}
                onChange={(lines) => setForm({ ...form, lines })}
              />
            </QueryState>
            {!canViewCost && ['receipt', 'opening', 'customer_return'].includes(form.kind) && (
              <Alert severity="info">{t('costRestrictedReceipt')}</Alert>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {canViewCost && (
                <TextField
                  fullWidth
                  label={t('fields.attachmentUrl')}
                  value={form.attachmentUrl}
                  onChange={(event) => setForm({ ...form, attachmentUrl: event.target.value })}
                />
              )}
              <Button component="label" variant="outlined" disabled={pending} sx={{ minWidth: 150 }}>
                {t('uploadAttachment')}
                <input
                  type="file"
                  hidden
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(event) => {
                    void upload(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
              </Button>
            </Stack>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label={t('fields.notes')}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
            <Typography variant="caption" color="text.secondary">
              {t('documentPostingHelp')}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={pending}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={pending || items.isLoading || items.isError}
            startIcon={pending ? <CircularProgress size={16} /> : undefined}>
            {t('saveDraft')}
          </Button>
          {canPost && (
            <Button
              variant="contained"
              disabled={pending || items.isLoading || items.isError}
              onClick={() => {
                void save(true);
              }}>
              {t(form.kind === 'stocktake' ? 'stocktake.approve' : 'savePost')}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
