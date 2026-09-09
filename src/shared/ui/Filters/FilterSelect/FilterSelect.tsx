import {
  type SelectChangeEvent,
  Box,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ListSubheader,
  TextField,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

export type FilterOption = {
  value: string | number;
  label: string;
};

type FilterSelectProps = {
  searchLabel?: string;
  label: string;
  value: Array<string | number>;
  options: FilterOption[];
  onChange: (values: string[]) => void;
  onApply: (values: string[]) => void;
  testId?: string;
  emptyLabel?: string;
  sx?: Record<string, unknown>;
};

export function FilterSelect({
  label,
  searchLabel,
  value,
  options,
  onChange,
  onApply,
  testId,
  emptyLabel = 'All',
  sx,
}: FilterSelectProps) {
  const id = `filter-${label.toLowerCase()}-select`;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectedValues = value.map((item) => item.toString());
  const latestSelectedValuesRef = useRef<string[]>(selectedValues);

  useEffect(() => {
    latestSelectedValuesRef.current = selectedValues;
  }, [selectedValues]);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const nextValue = event.target.value;
    const normalizedValue = (typeof nextValue === 'string' ? nextValue.split(',') : nextValue).map((item) =>
      item?.toString(),
    );

    latestSelectedValuesRef.current = normalizedValue;
    onChange(normalizedValue);
  };

  return (
    <FormControl sx={{ flexShrink: 0, width: 'auto', minWidth: 200, ...sx }}>
      <InputLabel size="small" htmlFor={id}>
        {label}
      </InputLabel>
      <Select<string[]>
        size="small"
        multiple
        label={label}
        value={selectedValues}
        onChange={handleChange}
        data-testid={testId}
        open={open}
        displayEmpty
        onOpen={() => {
          setSearch('');
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
          onApply(latestSelectedValuesRef.current);
        }}
        MenuProps={{
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onApply(latestSelectedValuesRef.current);
            }
          },
        }}
        renderValue={(selected) => {
          const selectedList = Array.isArray(selected) ? selected : [];
          if (selectedList.length === 0) return emptyLabel;
          const selectedOptions = options.filter((opt) => selectedList.includes(opt.value?.toString()));
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {selectedOptions.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  size="small"
                  onDelete={(e) => {
                    e.stopPropagation();
                    const updated = selectedList.filter((v) => v !== opt.value?.toString());
                    latestSelectedValuesRef.current = updated;
                    onChange(updated);
                    onApply(updated);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              ))}
            </Box>
          );
        }}
        inputProps={{ id }}>
        {searchLabel && (
          <ListSubheader
            onKeyDown={(event) => {
              if (event.key !== 'Escape') event.stopPropagation();
            }}>
            <TextField
              size="small"
              label={searchLabel}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              sx={{ my: 1 }}
            />
          </ListSubheader>
        )}
        {options
          .filter((option) => option.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
          .map((option) => (
            <MenuItem key={option.value} value={option.value?.toString()}>
              <Checkbox
                disableRipple
                size="small"
                checked={selectedValues.includes(option.value?.toString())}
                slotProps={{ input: { id: `${option.value}-checkbox` } }}
              />
              {option.label}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}
