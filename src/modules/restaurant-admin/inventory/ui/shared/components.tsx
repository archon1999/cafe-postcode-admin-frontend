import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';

import { inventoryError } from './helpers';

export function QueryState({
  query,
  empty,
  children,
}: {
  query: { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown };
  empty?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslate('inventory');
  if (query.isLoading)
    return (
      <Stack alignItems="center" sx={{ p: 6 }}>
        <CircularProgress size={30} aria-label={t('loading')} />
      </Stack>
    );
  if (query.isError)
    return (
      <Alert
        severity="error"
        action={
          <Button
            onClick={() => {
              void query.refetch();
            }}>
            {t('retry')}
          </Button>
        }>
        {inventoryError(query.error) || t('loadFailed')}
      </Alert>
    );
  if (empty)
    return (
      <Stack alignItems="center" spacing={1} sx={{ p: 6, textAlign: 'center' }}>
        <Iconify icon="solar:box-minimalistic-bold" width={48} />
        <Typography variant="h6">{t('empty.title')}</Typography>
        <Typography color="text.secondary">{t('empty.description')}</Typography>
      </Stack>
    );
  return <>{children}</>;
}

export function InventoryTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <TableContainer>
      <Table sx={{ minWidth: headers.length > 3 ? 800 : 480, '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell key={`${header}-${index}`} sx={{ whiteSpace: 'nowrap' }}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );
}

export function FormDialog({
  title,
  children,
  onClose,
  onSubmit,
  pending,
  error,
  submitLabel,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  pending: boolean;
  error?: string;
  submitLabel?: string;
  wide?: boolean;
}) {
  const { t } = useTranslate('inventory');
  return (
    <Dialog open onClose={pending ? undefined : onClose} fullWidth maxWidth={wide ? 'lg' : 'sm'}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {children}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button disabled={pending} onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={pending}
            startIcon={pending ? <CircularProgress size={16} /> : undefined}>
            {submitLabel || t('save')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
      <Box>
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>
  );
}
