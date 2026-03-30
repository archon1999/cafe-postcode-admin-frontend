import Button from '@mui/material/Button';
import type { ChipProps } from '@mui/material/Chip';
import type { Theme, SxProps } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

import { useTranslate } from 'app/providers/locales';

import { Iconify } from '../Iconify';

export const chipProps: ChipProps = { size: 'small', variant: 'soft' };

export type FiltersResultProps = React.ComponentProps<'div'> & {
  totalResults: number;
  onReset?: () => void;
  sx?: SxProps<Theme>;
  resetTestId?: string;
};

export function FiltersResult({ sx, onReset, children, totalResults, resetTestId, ...other }: FiltersResultProps) {
  const { t } = useTranslate('common');

  return (
    <ResultRoot sx={sx} {...other}>
      <ResultLabel>
        <strong>{totalResults}</strong>
        <span> {t('filters.resultsFound', { count: totalResults })}</span>
      </ResultLabel>

      <ResultContent>
        {children}

        <Button
          color="error"
          onClick={onReset}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          data-testid={resetTestId}>
          {t('actions.clear')}
        </Button>
      </ResultContent>
    </ResultRoot>
  );
}

const ResultRoot = styled('div')``;

const ResultLabel = styled('div')(({ theme }) => ({
  ...theme.typography.body2,
  marginBottom: theme.spacing(1.5),
  '& span': { color: theme.vars.palette.text.secondary },
}));

const ResultContent = styled('div')(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(1),
}));
