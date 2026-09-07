import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime } from 'shared/utils/format-time';

import { useInventoryReference } from '../../../../application';
import { inventoryNumber, inventoryUnitCost } from '../../../shared';
import { DocumentDetailDialog } from '../dialogs/DocumentDetailDialog';

export function InsightEvidence({ evidence }: { evidence: Record<string, unknown> }) {
  const { t } = useTranslate('inventory');
  const [document, setDocument] = useState<string | null>(null);
  const warehouses = useInventoryReference('warehouses');
  const items = useInventoryReference('items');
  const displayValue = (key: string, value: unknown) => {
    if (key === 'warehouse') return warehouses.data?.find((item) => item.id === value)?.name || t('warehouse');
    if (key === 'item') return items.data?.find((item) => item.id === value)?.name || t('fields.item');
    if (key === 'baseUnit') return t(`units.${String(value)}`);
    if (['occurredAt', 'postedAt', 'lastCountedAt'].includes(key)) return formatDateTime(String(value));
    if (key === 'requiresAttention') return t(value ? 'attention' : 'withinTolerance');
    if (['varianceValue', 'toleranceValue', 'monthlyVarianceValue'].includes(key)) return formatMoney(Number(value));
    if (['previousCost', 'latestCost'].includes(key)) return inventoryUnitCost(String(value));
    if (typeof value === 'number' || (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value))) {
      return inventoryNumber(value);
    }
    return Array.isArray(value) ? value.map(String).join(', ') : String(value);
  };
  return (
    <Stack spacing={0.75}>
      {Object.entries(evidence)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => {
          if (key === 'itemName' && evidence.item) return null;
          if (key === 'document' || key === 'documents') {
            const ids = Array.isArray(value) ? value : [value];
            return (
              <Stack direction="row" flexWrap="wrap" gap={1} key={key}>
                {ids.map((id, index) => (
                  <Button size="small" key={String(id)} onClick={() => setDocument(String(id))}>
                    {String(evidence.documentNumber || `${t('document')} ${index + 1}`)}
                  </Button>
                ))}
              </Stack>
            );
          }
          if (typeof value === 'object' && !Array.isArray(value)) return null;
          return (
            <Typography key={key} variant="body2">
              <strong>
                {key === 'itemName'
                  ? t('fields.item')
                  : t(`evidence.${key}`, { defaultValue: t(`fields.${key}`, { defaultValue: key }) })}
                :
              </strong>{' '}
              {displayValue(key, value)}
            </Typography>
          );
        })}
      {document && <DocumentDetailDialog id={document} onClose={() => setDocument(null)} />}
    </Stack>
  );
}
