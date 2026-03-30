import { type FieldValues, type UseFormProps, type UseFormReturn, useForm } from 'react-hook-form';

const returnDefaultOptions = <TFieldValues extends FieldValues = FieldValues>(): UseFormProps<TFieldValues> => {
  return {};
};

export const useHookForm = <TFieldValues extends FieldValues = FieldValues>(
  options: UseFormProps<TFieldValues>,
): UseFormReturn<TFieldValues> => {
  return useForm<TFieldValues>({
    ...returnDefaultOptions(),
    ...options,
  });
};
