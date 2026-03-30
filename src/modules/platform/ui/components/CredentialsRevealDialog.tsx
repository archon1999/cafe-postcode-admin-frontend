import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
import type { AdminGeneratedCredentials } from 'shared/api/admin-types';

type CredentialsRevealDialogProps = {
  open: boolean;
  title: string;
  description: string;
  credentials: AdminGeneratedCredentials | null;
  onClose: () => void;
};

export function CredentialsRevealDialog({
  open,
  title,
  description,
  credentials,
  onClose,
}: CredentialsRevealDialogProps) {
  const { t } = useTranslate('platform');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="warning">{description}</Alert>
          <Stack spacing={1.5}>
            <div>
              <Typography variant="caption" color="text.secondary">
                {t('fields.username')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {credentials?.username ?? '-'}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" color="text.secondary">
                {t('fields.password')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {credentials?.password ?? '-'}
              </Typography>
            </div>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="black" onClick={onClose}>
          {t('actions.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
