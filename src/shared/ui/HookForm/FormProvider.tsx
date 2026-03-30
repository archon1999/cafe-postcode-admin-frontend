import type React from 'react';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import { FormProvider as RHFForm } from 'react-hook-form';

export type FormProps<T extends FieldValues = FieldValues> = {
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
  methods: UseFormReturn<T, any, any>;
};

export function Form<T extends FieldValues = FieldValues>({ children, onSubmit, methods }: FormProps<T>) {
  return (
    <RHFForm {...methods}>
      <form onSubmit={onSubmit} noValidate autoComplete="off">
        {children}
      </form>
    </RHFForm>
  );
}
