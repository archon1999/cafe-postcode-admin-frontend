import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { PrintTemplatePreview, type PrintTemplateLayout } from 'modules/restaurant-admin/printing';
import type { AdminOrder, AdminReceipt } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import { formatDateTime } from 'shared/utils/format-time';

import { getReceiptKindTranslationKey, getReceiptStatusColor } from '../../lib/presenters';

type OrderReceiptPreviewDialogProps = {
  open: boolean;
  order: AdminOrder;
  onClose: () => void;
};

function isPrintTemplateLayout(value: unknown): value is PrintTemplateLayout {
  if (!value || typeof value !== 'object') return false;
  const layout = value as Record<string, unknown>;
  return layout.schemaVersion === 1 && layout.paperWidthMm === 80 && Array.isArray(layout.blocks);
}

export function hasReceiptPrintPreview(receipt: AdminReceipt) {
  return isPrintTemplateLayout(receipt.printLayout) && Boolean(receipt.printDataSnapshot);
}

export function OrderReceiptPreviewDialog({ open, order, onClose }: OrderReceiptPreviewDialogProps) {
  const { t } = useTranslate('orders');
  const previewableReceipts = useMemo(() => order.receipts.filter(hasReceiptPrintPreview), [order.receipts]);
  const [selectedReceiptId, setSelectedReceiptId] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedReceiptId((currentId) =>
      previewableReceipts.some((receipt) => receipt.id === currentId) ? currentId : (previewableReceipts[0]?.id ?? ''),
    );
  }, [open, previewableReceipts]);

  const receipt = previewableReceipts.find((item) => item.id === selectedReceiptId) ?? previewableReceipts[0];
  const layout = receipt?.printLayout;
  const data = receipt?.printDataSnapshot;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { bgcolor: 'background.neutral' },
        },
      }}>
      <DialogTitle sx={{ p: 2.5, bgcolor: 'background.paper' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6">{t('sections.receiptPreview')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('pages.orderDetail.title', { orderNumber: order.orderNumber })}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label={t('actions.closeReceiptPreview')}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {receipt && isPrintTemplateLayout(layout) && data ? (
          <Stack spacing={2.5}>
            {previewableReceipts.length > 1 ? (
              <FormControl fullWidth size="small">
                <InputLabel id="order-receipt-preview-label">{t('fields.receipt')}</InputLabel>
                <Select
                  labelId="order-receipt-preview-label"
                  value={receipt.id}
                  label={t('fields.receipt')}
                  onChange={(event) => setSelectedReceiptId(event.target.value)}>
                  {previewableReceipts.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {t(getReceiptKindTranslationKey(item.kind))} · {formatDateTime(item.createdAt)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                <Typography variant="subtitle2">{t(getReceiptKindTranslationKey(receipt.kind))}</Typography>
                <Label color={getReceiptStatusColor(receipt.status)} variant="soft">
                  {t(`receiptStatuses.${receipt.status}`)}
                </Label>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(receipt.createdAt)}
                </Typography>
              </Stack>
            )}

            <PrintTemplatePreview layout={layout} sampleData={data} showTitle={false} />
          </Stack>
        ) : (
          <Alert severity="info">{t('labels.receiptPreviewUnavailable')}</Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
