import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';
import { isValidElement } from 'react';
import type { ReactNode } from 'react';

export const EMPTY_VALUE_TEST_ID = 'empty-value-chip';
export const EMPTY_VALUE_TEXT = 'N/A';

export const isEmptyValue = (value: ReactNode) => {
  if (value === undefined || value === null || value === '' || value === EMPTY_VALUE_TEXT) {
    return true;
  }

  return false;
};

type EmptyValueChipProps = Omit<ChipProps, 'label'>;

export const EmptyValueChip = ({ 'data-testid': dataTestId, ...props }: EmptyValueChipProps) => (
  <Chip
    data-testid={dataTestId ?? EMPTY_VALUE_TEST_ID}
    label={EMPTY_VALUE_TEXT}
    size="small"
    variant="soft"
    {...props}
  />
);

export const renderEmptyValue = (value: ReactNode) => (isEmptyValue(value) ? <EmptyValueChip /> : value);

export const EMPTY_VALUE = <EmptyValueChip />;
