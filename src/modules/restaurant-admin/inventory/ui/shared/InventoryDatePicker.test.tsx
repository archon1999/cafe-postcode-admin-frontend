// @vitest-environment jsdom
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { InventoryDatePicker } from './InventoryDatePicker';

function Form() {
  const [date, setDate] = useState('2026-09-08');
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <InventoryDatePicker label="Date" value={date} onChange={setDate} />
      <output aria-label="Saved date">{date}</output>
    </LocalizationProvider>
  );
}

describe('inventory calendar', () => {
  afterEach(cleanup);
  it('opens a calendar and preserves the selected calendar day without UTC shifts', () => {
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: /choose date/i }));
    fireEvent.click(screen.getByRole('gridcell', { name: '15' }));
    expect(screen.getByLabelText('Saved date').textContent).toBe('2026-09-15');
  });
  it('clears an optional date', () => {
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(screen.getByLabelText('Saved date').textContent).toBe('');
  });
});
