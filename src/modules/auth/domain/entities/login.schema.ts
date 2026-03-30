import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, { message: 'Login talab qilinadi' }),
  password: z.string().min(1, { message: 'Parol talab qilinadi' }),
});
