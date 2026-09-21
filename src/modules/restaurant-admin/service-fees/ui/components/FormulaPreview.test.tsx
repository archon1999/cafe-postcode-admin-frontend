// @vitest-environment jsdom
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FormulaPreview } from './FormulaPreview';

vi.mock('app/providers/locales', () => ({ useTranslate: () => ({ t: (key: string) => key }) }));

function Form() {
  const [context, setContext] = useState({
    subtotal: 100000,
    guestCount: 1,
    startedAt: '2026-09-21T12:30:00Z',
    calculatedAt: '2026-09-21T13:30:00Z',
  });
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormulaPreview context={context} onChange={setContext} busy={false} onPreview={vi.fn()} />
      <output aria-label="Selected start">{context.startedAt}</output>
    </LocalizationProvider>
  );
}

describe('formula preview calendar', () => {
  afterEach(cleanup);
  it('shows Uzbekistan time and keeps that hour when a calendar date is selected', () => {
    render(<Form />);
    expect(screen.getAllByRole('spinbutton', { name: /hours/i })[0].getAttribute('aria-valuenow')).toBe('17');
    expect(screen.queryByText('serviceFees.timestampHint')).toBeNull();
    fireEvent.click(screen.getAllByRole('button', { name: /choose date/i })[0]);
    fireEvent.click(screen.getByRole('gridcell', { name: '15' }));
    expect(screen.getByLabelText('Selected start').textContent).toBe('2026-09-15T17:30:00+05:00');
  });
});
