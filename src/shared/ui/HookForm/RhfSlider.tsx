import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import type { FormHelperTextProps } from '@mui/material/FormHelperText';
import type { SliderProps } from '@mui/material/Slider';
import Slider from '@mui/material/Slider';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

import { HelperText } from './HelpText';

export type RHFSliderProps<T extends FieldValues = FieldValues> = SliderProps & {
  name: FieldPath<T>;
  helperText?: React.ReactNode;
  slotProps?: {
    wrapper?: BoxProps;
    helperText?: FormHelperTextProps;
  };
};

export function RHFSlider<T extends FieldValues = FieldValues>({
  name,
  helperText,
  slotProps,
  ...other
}: RHFSliderProps<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box {...slotProps?.wrapper}>
          <Slider {...field} valueLabelDisplay="auto" {...other} />

          <HelperText {...slotProps?.helperText} disableGutters errorMessage={error?.message} helperText={helperText} />
        </Box>
      )}
    />
  );
}
