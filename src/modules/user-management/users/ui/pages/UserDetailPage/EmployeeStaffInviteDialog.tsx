import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';

import { useCreateEmployeeStaffInviteMutation } from '../../../application';

type EmployeeStaffInviteDialogProps = {
  employeeId: string;
  open: boolean;
  onClose: () => void;
};

export function EmployeeStaffInviteDialog({ employeeId, open, onClose }: EmployeeStaffInviteDialogProps) {
  const { t } = useTranslate('users');
  const invite = useCreateEmployeeStaffInviteMutation(employeeId);
  const [copied, setCopied] = useState(false);

  const close = () => {
    invite.reset();
    setCopied(false);
    onClose();
  };

  const copy = async () => {
    if (!invite.data) return;
    try {
      await navigator.clipboard.writeText(invite.data.inviteUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{t('dialogs.staffInvite.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('dialogs.staffInvite.description')}
          </Typography>
          {invite.error ? <Alert severity="error">{t('dialogs.staffInvite.error')}</Alert> : null}
          {invite.data ? (
            <>
              <Alert severity="success">{t('dialogs.staffInvite.ready')}</Alert>
              <TextField
                label={t('fields.username')}
                value={invite.data.username}
                slotProps={{ input: { readOnly: true } }}
              />
              <TextField
                label={t('dialogs.staffInvite.link')}
                value={invite.data.inviteUrl}
                slotProps={{ input: { readOnly: true } }}
                onFocus={(event) => event.target.select()}
                helperText={t('dialogs.staffInvite.linkHint')}
                multiline
                minRows={2}
              />
              <Typography variant="caption" color="text.secondary">
                {t('dialogs.staffInvite.expires')}: {new Date(invite.data.expiresAt).toLocaleString()}
              </Typography>
              {!copied ? null : (
                <Typography variant="caption" color="success.main">
                  {t('dialogs.staffInvite.copied')}
                </Typography>
              )}
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={close}>{t('dialogs.staffInvite.close')}</Button>
        {invite.data ? (
          <Button variant="contained" onClick={() => void copy()} startIcon={<Iconify icon="solar:copy-bold" />}>
            {t('dialogs.staffInvite.copy')}
          </Button>
        ) : (
          <Button variant="contained" loading={invite.isPending} onClick={() => invite.mutate()}>
            {t('dialogs.staffInvite.create')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
