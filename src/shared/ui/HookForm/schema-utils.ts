import * as z from 'zod';

import { toTashkentCalendarDayjs } from 'shared/utils/dayjs';

type SchemaErrorMessages = {
  required?: string;
  invalid?: string;
};

export const schemaUtils = {
  phoneNumber: (props?: { error?: SchemaErrorMessages; isValid?: (val: string) => boolean }) =>
    z
      .string()
      .min(1, { error: props?.error?.required ?? 'Phone number is required!' })
      .refine((val) => props?.isValid?.(val), {
        error: props?.error?.invalid ?? 'Invalid phone number!',
      }),

  email: (props?: { error?: SchemaErrorMessages }) =>
    z.email({
      error: ({ input, code }) =>
        input && code.startsWith('invalid')
          ? (props?.error?.invalid ?? 'Email must be a valid email address!')
          : (props?.error?.required ?? 'Email is required!'),
    }),

  date: (props?: { error?: SchemaErrorMessages }) =>
    z.preprocess(
      (val) => (val === undefined ? null : val),
      z.union([z.string(), z.number(), z.date(), z.null()]).check((ctx) => {
        const value = ctx.value;

        if (value === null || value === '') {
          ctx.issues.push({
            code: 'custom',
            message: props?.error?.required ?? 'Date is required!',
            input: value,
          });
          return;
        }

        if (!toTashkentCalendarDayjs(value).isValid()) {
          ctx.issues.push({
            code: 'custom',
            message: props?.error?.invalid ?? 'Invalid date!',
            input: value,
          });
        }
      }),
    ),

  editor: (props?: { error?: string }) =>
    z.string().refine(
      (val) => {
        const cleanedValue = val.trim();
        return cleanedValue !== '' && cleanedValue !== '<p></p>';
      },
      { error: props?.error ?? 'Content is required!' },
    ),

  nullableInput: <T extends z.ZodTypeAny>(schema: T, options?: { error?: string }) =>
    schema.nullable().refine((val) => val !== null && val !== undefined, {
      error: options?.error ?? 'Field is required!',
    }),

  boolean: (props?: { error?: string }) =>
    z.boolean().refine((val) => val === true, {
      error: props?.error ?? 'Field is required!',
    }),

  sliderRange: (props: { error?: string; min: number; max: number }) =>
    z
      .number()
      .array()
      .refine((val) => val[0] >= props.min && val[1] <= props.max, {
        error: props.error ?? `Range must be between ${props.min} and ${props.max}`,
      }),

  file: (props?: { error?: string }) =>
    z
      .file()
      .or(z.string())
      .or(z.null())
      .check((ctx) => {
        const value = ctx.value;
        if (!value || (typeof value === 'string' && !value.length)) {
          ctx.issues.push({
            code: 'custom',
            message: props?.error ?? 'File is required!',
            input: value,
          });
        }
      }),

  files: (props?: { error: string; minFiles?: number }) =>
    z.array(z.union([z.string(), z.file()])).min(1, { error: props?.error ?? 'Files is required!' }),
};

export function testCase<T extends z.ZodTypeAny>(schema: T, values: unknown[]) {
  const color = {
    green: (txt: string) => `\x1b[32m${txt}\x1b[0m`,
    red: (txt: string) => `\x1b[31m${txt}\x1b[0m`,
    gray: (txt: string) => `\x1b[90m${txt}\x1b[0m`,
  };

  values.forEach((value) => {
    const { data, success, error } = schema.safeParse(value);
    const type = color.gray(`(${typeof value})`);
    const serializedValue = JSON.stringify(value);

    const label = success ? color.green(`✅ Valid - ${serializedValue}`) : color.red(`❌ Error - ${serializedValue}`);
    const payload = success ? data : z.treeifyError(error);

    console.warn(`${label} ${type}:`, JSON.stringify(payload, null, 2));
  });
}
