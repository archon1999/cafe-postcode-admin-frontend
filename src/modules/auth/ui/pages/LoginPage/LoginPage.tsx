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
import { loginSchema } from '../../../domain/entities/login.schema';

import { FormHead } from './FormHead';
import { defaultValues, type LoginSchemaType } from './model/model';

const LoginPage = () => {
  const { t } = useTranslate('auth');
  const [showPassword, setPassword] = useState(false);

  const methods = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues,
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
      <FormHead
        title={t('login.title')}
        description={<Typography variant="body2">{t('login.description')}</Typography>}
      />

      <Form onSubmit={onSubmit} methods={methods}>
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          <RHFTextField<LoginSchemaType>
            name="username"
            label={t('login.username')}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { 'data-testid': 'login-username' } }}
          />

          <RHFTextField<LoginSchemaType>
            name="password"
            label={t('login.password')}
            type={showPassword ? 'text' : 'password'}
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
