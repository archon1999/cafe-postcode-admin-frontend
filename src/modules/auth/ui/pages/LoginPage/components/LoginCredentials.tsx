import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useColorScheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useState, type FormEventHandler } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import { Form, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';

import type { LoginSchemaType } from '../../../../domain/entities/login.schema';

type LoginCredentialsProps = {
  methods: UseFormReturn<LoginSchemaType>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  error: string | null;
  isPending: boolean;
};

export function LoginCredentials({ methods, onSubmit, error, isPending }: LoginCredentialsProps) {
  const { t } = useTranslate('auth');
  const { colorScheme } = useColorScheme();
  const [showPassword, setShowPassword] = useState(false);
  const dark = colorScheme === 'dark';
  const text = dark ? '#F3F5F7' : '#191B1F';
  const secondary = dark ? '#AAB4BF' : '#64707A';
  const fieldBorder = dark ? '#46515E' : '#D4DAD9';
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      height: 54,
      bgcolor: dark ? '#222A34' : '#FFFFFF',
      borderRadius: 1.25,
      color: text,
      fontSize: 15,
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: dark ? '#788594' : '#8A949C' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0C68E9', borderWidth: 2 },
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: fieldBorder },
    '& .MuiInputBase-input::placeholder': { color: secondary, opacity: 1 },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        component="h1"
        sx={{
          maxWidth: 410,
          color: text,
          fontSize: { xs: 35, md: 40 },
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: -1.65,
          mb: 1.5,
        }}>
        {t('login.title')}
      </Typography>
      <Typography sx={{ maxWidth: 370, color: secondary, fontSize: 15, lineHeight: 1.55, mb: 4.5 }}>
        {t('loginFlow.credentials.description')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {t(error)}
        </Alert>
      )}
      <Form onSubmit={onSubmit} methods={methods} autoComplete="on">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography
              component="label"
              htmlFor="login-username"
              sx={{ display: 'block', color: text, mb: 0.9, fontSize: 14, fontWeight: 700 }}>
              {t('login.username')}
            </Typography>
            <RHFTextField<LoginSchemaType>
              id="login-username"
              name="username"
              variant="outlined"
              placeholder={t('login.username')}
              autoComplete="username"
              sx={fieldSx}
              slotProps={{ htmlInput: { 'aria-label': t('login.username'), 'data-testid': 'login-username' } }}
            />
          </Box>
          <Box>
            <Typography
              component="label"
              htmlFor="login-password"
              sx={{ display: 'block', color: text, mb: 0.9, fontSize: 14, fontWeight: 700 }}>
              {t('login.password')}
            </Typography>
            <RHFTextField<LoginSchemaType>
              id="login-password"
              name="password"
              variant="outlined"
              placeholder={t('login.password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              sx={fieldSx}
              slotProps={{
                htmlInput: { 'aria-label': t('login.password'), 'data-testid': 'login-password' },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t(showPassword ? 'login.hidePassword' : 'login.showPassword')}
                        onClick={() => setShowPassword((current) => !current)}
                        edge="end"
                        data-testid="login-password-toggle"
                        sx={{ color: secondary }}>
                        <Iconify icon={showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            loading={isPending}
            data-testid="login-submit"
            sx={{
              minHeight: 54,
              mt: 1.5,
              px: 2.5,
              borderRadius: 1.25,
              bgcolor: '#0C68E9',
              color: '#FFF',
              fontSize: 15,
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#075CCF', boxShadow: 'none' },
            }}>
            <Box sx={{ flex: 1, textAlign: 'left' }}>{t('login.submit')}</Box>
            <Box component="span" aria-hidden="true" sx={{ fontSize: 23, fontWeight: 400, lineHeight: 1 }}>
              →
            </Box>
          </Button>
        </Box>
      </Form>
    </Box>
  );
}
