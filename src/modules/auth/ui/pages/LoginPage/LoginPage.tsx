import { zodResolver } from '@hookform/resolvers/zod';
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
import { loginSchema, LoginSchemaType } from '../../../domain/entities/login.schema';

const LoginPage = () => {
  const { t } = useTranslate('auth');
  const [showPassword, setPassword] = useState(false);

  const methods = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const loginMutation = useLoginMutation();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <>
      <AnimateLogoRotate sx={{ mb: 3, mx: 'auto' }} />
      <Box
        sx={{
          mb: 5,
          gap: 1.5,
          display: 'flex',
          textAlign: 'center',
          whiteSpace: 'pre-line',
          flexDirection: 'column',
        }}>
        <Typography variant="h5">{t('login.title')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('login.description')}
        </Typography>
      </Box>

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
                      onClick={() => setPassword((prevValue) => !prevValue)}
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
            loading={isSubmitting}
            loadingIndicator={t('login.signingIn')}
            data-testid="login-submit">
            {t('login.submit')}
          </Button>
        </Box>
      </Form>
    </>
  );
};

export default LoginPage;
