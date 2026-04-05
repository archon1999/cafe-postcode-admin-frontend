import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
export type CredentialsRevealField = {
  label: string;
  value: string | null | undefined;
};

type CredentialsRevealDialogProps = {
  open: boolean;
  title: string;
  description: string;
  fields: CredentialsRevealField[];
  onClose: () => void;
};

export function CredentialsRevealDialog({ open, title, description, fields, onClose }: CredentialsRevealDialogProps) {
  const { t } = useTranslate('platform');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="warning">{description}</Alert>
          <Stack spacing={1.5}>
            {fields.length ? (
              fields.map((field) => (
                <div key={field.label}>
                  <Typography variant="caption" color="text.secondary">
                    {field.label}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {field.value ?? '-'}
                  </Typography>
                </div>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('labels.notSelected')}
              </Typography>
            )}
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
