import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import { Controller, useFormContext, type FieldValues, type Path } from 'react-hook-form';

import type { UploadProps } from '../Upload';
import { Upload, UploadBox, UploadAvatar } from '../Upload';

import { HelperText } from './help-text';

export type RHFUploadProps<TForm extends FieldValues = FieldValues> = UploadProps & {
  name: Path<TForm>;
  slotProps?: {
    wrapper?: BoxProps;
  };
};

export function RHFUploadAvatar<TForm extends FieldValues = FieldValues>({
  name,
  slotProps,
  ...other
}: RHFUploadProps<TForm>) {
  const { control, setValue, resetField } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const onDrop = (acceptedFiles: File[]) => {
          const value = acceptedFiles[0];

          setValue(name, value as any, { shouldValidate: true });
        };

        const onReset = () => {
          resetField(name, { defaultValue: undefined });
        };

        return (
          <Box {...slotProps?.wrapper}>
            <UploadAvatar value={field.value} error={!!error} onDrop={onDrop} onReset={onReset} {...other} />
            <HelperText errorMessage={error?.message} sx={{ justifyContent: 'center' }} />
          </Box>
        );
      }}
    />
  );
}

export function RHFUploadBox({ name, ...other }: RHFUploadProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => <UploadBox value={field.value} error={!!error} {...other} />}
    />
  );
}

export function RHFUpload({ name, multiple, helperText, ...other }: RHFUploadProps) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const uploadProps = {
          multiple,
          accept: { 'image/*': [] },
          error: !!error,
          helperText: error?.message ?? helperText,
        };

        const onDrop = (acceptedFiles: File[]) => {
          const value = multiple ? [...field.value, ...acceptedFiles] : acceptedFiles[0];

          setValue(name, value, { shouldValidate: true });
        };

        return <Upload {...uploadProps} value={field.value} onDrop={onDrop} {...other} />;
      }}
    />
  );
}
