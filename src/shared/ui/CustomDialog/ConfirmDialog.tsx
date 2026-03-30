import { Box, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { Iconify } from '../Iconify';

import type { ConfirmDialogProps } from './types';

export function ConfirmDialog({
  open,
  title,
  action,
  content,
  onClose,
  cancelLabel = 'Cancel',
  cancelTestId,
  ...other
}: ConfirmDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>
        <IconButton sx={{ mr: 2 }} onClick={onClose}>
          <Iconify icon={'mingcute:close-line'} />
        </IconButton>
      </Box>

      {content && <DialogContent sx={{ typography: 'body2' }}> {content}</DialogContent>}

      <DialogActions>
        {action}

        <Button variant="outlined" color="inherit" onClick={onClose} data-testid={cancelTestId}>
          {cancelLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
