import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import type { FormHelperTextProps } from '@mui/material/FormHelperText';
import type { RatingProps } from '@mui/material/Rating';
import Rating from '@mui/material/Rating';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

import { HelperText } from './HelpText';

export type RHFRatingProps<T extends FieldValues = FieldValues> = RatingProps & {
  name: FieldPath<T>;
  helperText?: React.ReactNode;
  slotProps?: {
    wrapper?: BoxProps;
    helperText?: FormHelperTextProps;
  };
};

export function RHFRating<T extends FieldValues = FieldValues>({
  name,
  helperText,
  slotProps,
  ...other
}: RHFRatingProps<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box
          {...slotProps?.wrapper}
          sx={[
            { display: 'flex', flexDirection: 'column' },
            ...(Array.isArray(slotProps?.wrapper?.sx) ? slotProps.wrapper.sx : [slotProps?.wrapper?.sx]),
          ]}>
          <Rating {...field} onChange={(_event, newValue) => field.onChange(Number(newValue))} {...other} />

          <HelperText {...slotProps?.helperText} disableGutters errorMessage={error?.message} helperText={helperText} />
        </Box>
      )}
    />
  );
}
