import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import { AnimateLogoRotate } from 'shared/ui/Animate';
import { Form, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';

import { useLoginMutation } from '../../../application/mutations';
import { loginSchema, type LoginSchemaType } from '../../../domain/entities/login.schema';

const LoginPage = () => {
  const { t } = useTranslate('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const methods = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });
  const loginMutation = useLoginMutation();
  const onSubmit = methods.handleSubmit(async (data) => {
    setError(false);
    try {
      const response = await loginMutation.mutateAsync(data);
      if (response.status !== 'authenticated') setError(true);
    } catch {
      setError(true);
    }
  });

  return (
    <>
      <AnimateLogoRotate sx={{ mb: 3, mx: 'auto' }} />
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h5">{t('loginFlow.credentials.title')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          {t('loginFlow.credentials.description')}
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('loginFlow.error')}
        </Alert>
      )}
      <Form onSubmit={onSubmit} methods={methods} autoComplete="on">
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          <RHFTextField<LoginSchemaType>
            name="username"
            label={t('login.username')}
            autoComplete="username"
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { 'data-testid': 'login-username' } }}
          />
          <RHFTextField<LoginSchemaType>
            name="password"
            label={t('login.password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { 'data-testid': 'login-password' },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((current) => !current)}
                      edge="end"
                      data-testid="login-password-toggle">
                      <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={loginMutation.isPending}
            data-testid="login-submit">
            {t('login.submit')}
          </Button>
        </Box>
      </Form>
    </>
  );
};

export default LoginPage;
