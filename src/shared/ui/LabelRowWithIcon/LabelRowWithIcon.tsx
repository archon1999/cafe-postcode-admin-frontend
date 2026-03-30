import { Box, Stack, Typography } from '@mui/material';
import type { FC } from 'react';

import { EmptyValueChip, isEmptyValue } from 'shared/ui/EmptyValue';

import { Iconify, type IconifyName } from '../Iconify';

interface LabelRowWithIconProps {
  label: string;
  value?: string | number;
  icon: IconifyName;
  maxLines?: number;
}

export const LabelRowWithIcon: FC<LabelRowWithIconProps> = ({ label, value, icon, maxLines = 1 }) => {
  const valueContent = isEmptyValue(value) ? (
    <EmptyValueChip />
  ) : (
    <Typography
      variant="subtitle2"
      sx={[
        (theme) => ({
          ...theme.mixins.maxLine({ line: maxLines }),
        }),
      ]}
      component="span">
      {value}
    </Typography>
  );

  return (
    <Stack direction="row" spacing={1}>
      <Iconify icon={icon} width={20} height={20} />
      <Stack direction="column">
        <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
          {label}
        </Box>

        {valueContent}
      </Stack>
    </Stack>
  );
};
