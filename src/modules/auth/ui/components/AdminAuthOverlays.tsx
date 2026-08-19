import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type FormEvent, useState } from 'react';

import { useTranslate } from 'app/providers/locales';

import { useLogoutMutation, useUnlockMutation } from '../../application/mutations';
import { useAuthStore } from '../../domain/stores/authentication.store';

function LockedSessionScreen() {
  const { t } = useTranslate('auth');
  const isLocked = useAuthStore((state) => state.status === 'locked');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const unlockMutation = useUnlockMutation({
    onSuccess: () => {
      setPassword('');
      setError(false);
    },
    onError: () => setError(true),
  });
  const logoutMutation = useLogoutMutation();
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(false);
    unlockMutation.mutate(password);
  };

  return (
    <Dialog open={isLocked} fullScreen disableEscapeKeyDown aria-labelledby="admin-lock-title">
      <DialogContent sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 420, width: '100%' }}>
          <Typography id="admin-lock-title" variant="h4" textAlign="center" gutterBottom>
            {t('lock.title')}
          </Typography>
          <Typography color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            {t('lock.description')}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t('lock.error')}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            label={t('login.password')}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            inputProps={{ 'data-testid': 'admin-unlock-password' }}
          />
          <Button
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            disabled={!password || unlockMutation.isPending}
            sx={{ mt: 2 }}>
            {t('lock.unlock')}
          </Button>
          <Button
            fullWidth
            color="inherit"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            sx={{ mt: 1 }}>
            {t('lock.logout')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export function AdminAuthOverlays() {
  return <LockedSessionScreen />;
}
