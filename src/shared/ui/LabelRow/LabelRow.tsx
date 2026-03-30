import { Box, Tooltip, Typography } from '@mui/material';
import type { FC } from 'react';

import { EMPTY_VALUE_TEXT, isEmptyValue, renderEmptyValue } from 'shared/ui/EmptyValue';

interface LabelRowProps {
  label: string;
  value?: string | number | React.ReactNode;
  children?: React.ReactNode;
  maxLines?: number;
  withTooltip?: boolean;
  testId?: string;
  valueTestId?: string;
}

export const LabelRow: FC<LabelRowProps> = ({
  label,
  value,
  children,
  maxLines = 1,
  withTooltip = false,
  testId,
  valueTestId,
}) => {
  const displayValue = children ?? value;
  const tooltipTitle = isEmptyValue(displayValue) ? EMPTY_VALUE_TEXT : displayValue;
  const renderedValue = renderEmptyValue(displayValue);
  const content = withTooltip ? (
    <Tooltip title={tooltipTitle}>
      <Typography
        sx={[
          (theme) => ({
            ...theme.mixins.maxLine({ line: maxLines }),
          }),
        ]}
        component="span"
        data-testid={valueTestId}>
        {renderedValue}
      </Typography>
    </Tooltip>
  ) : (
    <Typography
      sx={[
        (theme) => ({
          ...theme.mixins.maxLine({ line: maxLines }),
        }),
      ]}
      component="span"
      data-testid={valueTestId}>
      {renderedValue}
    </Typography>
  );

  return (
    <Box sx={{ display: 'flex', typography: 'body2', justifyContent: 'space-between', gap: 8 }} data-testid={testId}>
      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 'semibold' }}>
        {label}:
      </Box>

      {content}
    </Box>
  );
};
