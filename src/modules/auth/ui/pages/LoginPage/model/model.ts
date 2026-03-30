import type z from 'zod';

import type { loginSchema } from 'modules/auth';

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const defaultValues: LoginSchemaType = {
  username: '',
  password: '',
};
