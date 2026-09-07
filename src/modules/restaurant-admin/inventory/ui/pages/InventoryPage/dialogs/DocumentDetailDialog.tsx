import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { downloadBlob } from 'shared/utils/download';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime } from 'shared/utils/format-time';

import { useInventoryAccess, useInventoryCommands, useInventoryDocument } from '../../../../application';
import { inventoryAttachmentId, type InventoryDocument } from '../../../../domain';
import { InventoryTable, QueryState, inventoryError, inventoryNumber, inventoryUnitCost } from '../../../shared';

export function DocumentDetailDialog({
  id,
  onClose,
  onEdit,
}: {
  id: string;
  onClose: () => void;
  onEdit?: (document: InventoryDocument) => void;
}) {
  const { t } = useTranslate('inventory');
  const { canManage, canPost, canViewCost } = useInventoryAccess();
  const query = useInventoryDocument(id);
  const commands = useInventoryCommands();
  const [reversing, setReversing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const document = query.data;
  const manual =
    document &&
    ['opening', 'receipt', 'issue', 'supplier_return', 'customer_return', 'stocktake'].includes(document.kind);
  const exportFile = async () => {
    try {
      const blob = await commands.exportDocument.mutateAsync(id);
      downloadBlob(blob, `${document?.number || 'inventory'}.csv`);
    } catch (cause) {
      setError(inventoryError(cause) || t('loadFailed'));
    }
  };
  const reverse = async () => {
    if (!reason.trim()) return;
    try {
      await commands.reverseDocument.mutateAsync({ id, reason: reason.trim() });
      setReversing(false);
      setReason('');
    } catch (cause) {
      setError(inventoryError(cause) || t('saveFailed'));
    }
  };
  const post = async () => {
    try {
      await commands.postDocument.mutateAsync(id);
      setApproving(false);
      setError('');
    } catch (cause) {
      setError(inventoryError(cause) || t('saveFailed'));
    }
  };
  const downloadAttachment = async () => {
    const attachment = inventoryAttachmentId(document?.attachmentUrl || '');
    if (!attachment) return;
    try {
      const blob = await commands.downloadAttachment.mutateAsync(attachment);
      const suffix = blob.type.includes('pdf') ? 'pdf' : blob.type.includes('png') ? 'png' : 'jpg';
      downloadBlob(blob, `${document?.number || 'document'}.${suffix}`);
    } catch (cause) {
      setError(inventoryError(cause) || t('loadFailed'));
    }
  };
  return (
    <Dialog open onClose={commands.reverseDocument.isPending ? undefined : onClose} fullWidth maxWidth="lg">
      <DialogTitle>{document?.number || t('document')}</DialogTitle>
      <DialogContent>
        <QueryState query={query}>
          {document && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <Stack direction="row" spacing={1}>
                <Chip label={t(`kinds.${document.kind}`)} />
                <Chip
                  color={
                    document.status === 'posted' ? 'success' : document.status === 'reversed' ? 'error' : 'default'
                  }
                  label={t(`statuses.${document.status}`)}
                />
              </Stack>
              <Typography>
                {document.warehouseName} · {formatDateTime(document.occurredAt)}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={3}>
                <Typography variant="body2">
                  {t('fields.reference')}: {document.reference || '—'}
                </Typography>
                <Typography variant="body2">
                  {t('fields.responsibleName')}: {document.responsibleName || '—'}
                </Typography>
                {document.supplierName && (
                  <Typography variant="body2">
                    {t('fields.supplier')}: {document.supplierName}
                  </Typography>
                )}
              </Stack>
              {document.reason && (
                <Typography variant="body2">
                  {t('fields.reason')}: {document.reason}
                </Typography>
              )}
              <InventoryTable
                headers={[
                  t('fields.item'),
                  t('fields.quantity'),
                  t('fields.baseQuantity'),
                  ...(document.kind === 'stocktake'
                    ? [t('fields.expectedQuantity'), t('fields.varianceQuantity')]
                    : []),
                  ...(canViewCost
                    ? [t('fields.unitCost'), ...(document.kind === 'stocktake' ? [t('fields.varianceValue')] : [])]
                    : []),
                  t('fields.lotNumber'),
                  t('fields.expiresOn'),
                ]}>
                {document.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.itemName}</TableCell>
                    <TableCell>
                      {line.quantity === null ? t('stocktake.uncounted') : inventoryNumber(line.quantity)}
                      {line.quantity !== null && (
                        <Typography variant="caption" component="div" color="text.secondary">
                          {line.inputUnit === 'purchase' ? t('purchase') : t(`units.${line.baseUnit}`)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {line.quantity === null
                        ? '—'
                        : `${inventoryNumber(line.baseQuantity)} ${t(`units.${line.baseUnit}`)}`}
                    </TableCell>
                    {document.kind === 'stocktake' && (
                      <>
                        <TableCell>{inventoryNumber(line.expectedQuantity)}</TableCell>
                        <TableCell>{inventoryNumber(line.varianceQuantity)}</TableCell>
                      </>
                    )}
                    {canViewCost && (
                      <>
                        <TableCell>
                          {line.unitCost === null || line.unitCost === undefined
                            ? '—'
                            : inventoryUnitCost(line.unitCost)}
                        </TableCell>
                        {document.kind === 'stocktake' && (
                          <TableCell>
                            {line.varianceValue === null || line.varianceValue === undefined
                              ? '—'
                              : formatMoney(Number(line.varianceValue))}
                          </TableCell>
                        )}
                      </>
                    )}
                    <TableCell>{line.lotNumber || '—'}</TableCell>
                    <TableCell>{line.expiresOn || '—'}</TableCell>
                  </TableRow>
                ))}
              </InventoryTable>
              {canViewCost &&
                document.totalValue !== null &&
                !(document.kind === 'stocktake' && document.status === 'draft') && (
                  <Typography variant="h6" textAlign="right">
                    {t('fields.totalValue')}: {formatMoney(Number(document.totalValue))}
                  </Typography>
                )}
              {document.notes && (
                <Typography>
                  {document.notes.startsWith('late_after_count:') ? t('rules.late.detail') : document.notes}
                </Typography>
              )}
              {canViewCost &&
                document.attachmentUrl &&
                (inventoryAttachmentId(document.attachmentUrl) ? (
                  <Button
                    sx={{ alignSelf: 'flex-start' }}
                    disabled={commands.downloadAttachment.isPending}
                    onClick={() => {
                      void downloadAttachment();
                    }}>
                    {t('attachment')}
                  </Button>
                ) : (
                  <Link href={document.attachmentUrl} target="_blank" rel="noopener noreferrer">
                    {t('attachment')}
                  </Link>
                ))}
              {canViewCost && document.valuationAdjustment && Number(document.valuationAdjustment) !== 0 && (
                <Alert severity="info">
                  {t('valuationAdjustmentHelp', {
                    value: formatMoney(Number(document.valuationAdjustment)),
                    purchaseValue: formatMoney(Number(document.purchaseValue)),
                  })}
                </Alert>
              )}
              {document.consumptions?.map((consumption) => (
                <Stack key={consumption.orderItem} spacing={1}>
                  <Typography variant="subtitle2">
                    {t('consumption.title', {
                      version: consumption.recipeVersion,
                      quantity: inventoryNumber(consumption.quantity),
                    })}
                  </Typography>
                  {consumption.resolutions.map((resolution, index) => (
                    <Typography key={index} variant="body2">
                      {t(`consumption.${resolution.disposition}`)} · {inventoryNumber(resolution.quantity)} ·{' '}
                      {formatDateTime(resolution.createdAt)} · {resolution.createdByName}
                    </Typography>
                  ))}
                </Stack>
              ))}
              <Typography variant="caption" color="text.secondary">
                {t('createdBy')}: {document.createdByName} · {formatDateTime(document.createdAt)}
                {document.postedAt
                  ? ` · ${t('postedBy')}: ${document.postedByName} · ${formatDateTime(document.postedAt)}`
                  : ''}
              </Typography>
              {approving && (
                <Stack spacing={2}>
                  <Alert severity="warning">{t('postHelp')}</Alert>
                  <Stack direction="row" gap={1}>
                    <Button onClick={() => setApproving(false)}>{t('cancel')}</Button>
                    <Button
                      variant="contained"
                      disabled={commands.postDocument.isPending}
                      onClick={() => {
                        void post();
                      }}>
                      {t(document.kind === 'stocktake' ? 'stocktake.approve' : 'post')}
                    </Button>
                  </Stack>
                </Stack>
              )}
              {reversing && (
                <Stack spacing={2}>
                  <Alert severity="warning">{t('reverseHelp')}</Alert>
                  <TextField
                    multiline
                    minRows={2}
                    required
                    label={t('fields.reason')}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button onClick={() => setReversing(false)}>{t('cancel')}</Button>
                    <Button
                      color="error"
                      variant="contained"
                      disabled={!reason.trim() || commands.reverseDocument.isPending}
                      onClick={() => {
                        void reverse();
                      }}>
                      {t('reverseConfirm')}
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}
        </QueryState>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>{t('close')}</Button>
        <Button
          disabled={!document || commands.exportDocument.isPending}
          onClick={() => {
            void exportFile();
          }}>
          {t('export')}
        </Button>
        {document && manual && document.status === 'draft' && canManage && onEdit && (
          <Button variant="contained" onClick={() => onEdit(document)}>
            {t('edit.action')}
          </Button>
        )}
        {document && manual && document.status === 'draft' && canPost && !approving && (
          <Button
            variant="contained"
            disabled={document.kind === 'stocktake' && document.lines.some((line) => line.quantity === null)}
            onClick={() => setApproving(true)}>
            {t('post')}
          </Button>
        )}
        {document && manual && document.status === 'posted' && canPost && !reversing && (
          <Button color="error" onClick={() => setReversing(true)}>
            {t('reverse')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
