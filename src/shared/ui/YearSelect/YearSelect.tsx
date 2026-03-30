import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useMemo } from 'react';

const DEFAULT_YEARS = [2026, 2025];

type YearSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  testId?: string;
  minWidth?: number;
};

export const YearSelect = ({
  label,
  value,
  onChange,
  allLabel,
  testId = 'trip-completed-year-select',
  minWidth = 140,
}: YearSelectProps) => {
  const options = useMemo(() => {
    const set = new Set<number>(DEFAULT_YEARS);
    return Array.from(set).sort((a, b) => b - a);
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth }}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={handleChange} inputProps={{ 'data-testid': testId }}>
        <MenuItem value="all">{allLabel}</MenuItem>
        {options.map((year) => (
          <MenuItem key={year} value={year.toString()}>
            {year}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
