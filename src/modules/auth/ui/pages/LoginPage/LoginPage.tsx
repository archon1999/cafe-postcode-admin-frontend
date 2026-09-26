import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useLoginMutation } from '../../../application/mutations';
import { loginSchema, type LoginSchemaType } from '../../../domain/entities/login.schema';

import { LoginCredentials } from './components/LoginCredentials';
import { LoginLayout } from './components/LoginLayout';

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const methods = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });
  const loginMutation = useLoginMutation();
  const onSubmit = methods.handleSubmit(async (data) => {
    setError(null);
    try {
      const response = await loginMutation.mutateAsync(data);
      if (response.status !== 'authenticated') setError('loginFlow.error');
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      setError(!status || status >= 500 ? 'connection.error' : 'loginFlow.error');
    }
  });

  return (
    <LoginLayout>
      <LoginCredentials methods={methods} onSubmit={onSubmit} error={error} isPending={loginMutation.isPending} />
    </LoginLayout>
  );
};

export default LoginPage;
