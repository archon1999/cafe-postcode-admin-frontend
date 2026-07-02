import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type OrderNumberCellProps = {
  orderNumber: number;
  displayName?: string | null;
};

export function formatOrderIdLabel(orderNumber: number) {
  return `ID ${orderNumber}`;
}

export function formatOrderNumberCellValue(orderNumber: number, displayName?: string | null) {
  const normalizedDisplayName = displayName?.trim();
  const orderLabel = formatOrderIdLabel(orderNumber);

  return normalizedDisplayName ? `${orderLabel} ${normalizedDisplayName}` : orderLabel;
}

export function OrderNumberCell({ orderNumber, displayName }: OrderNumberCellProps) {
  const normalizedDisplayName = displayName?.trim();

  return (
    <Stack spacing={0.15} sx={{ minWidth: 0, lineHeight: 1.2, whiteSpace: 'normal' }}>
      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
        {formatOrderIdLabel(orderNumber)}
      </Typography>
      {normalizedDisplayName ? (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
          {normalizedDisplayName}
        </Typography>
      ) : null}
    </Stack>
  );
}
