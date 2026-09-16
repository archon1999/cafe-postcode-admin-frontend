/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DraftTable } from './ConstructorTableCard';
import { HallConstructorInspector } from './HallConstructorInspector';

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('shared/ui/Iconify', () => ({
  Iconify: () => null,
}));

const initialTable: DraftTable = {
  localId: 'table-1',
  id: 'table-1',
  name: 'Table 1',
  tableNumber: '1',
  seatCount: 4,
  shapeVariant: 'seat4_square',
  positionX: 0,
  positionY: 0,
  width: 1,
  height: 1,
  serviceFeeEnabled: false,
  serviceFeeMode: 'percentage',
  serviceFeePercent: 0,
  serviceFeeHourlyRate: 0,
  isActive: true,
};

function InspectorHarness() {
  const [table, setTable] = useState(initialTable);

  return (
    <>
      <HallConstructorInspector
        selectedTable={table}
        onDelete={() => undefined}
        updateSelectedTable={(updater) => setTable((current) => updater(current))}
      />
      <output data-testid="seat-count">{table.seatCount}</output>
    </>
  );
}

afterEach(cleanup);

describe('HallConstructorInspector seat count', () => {
  it('offers preset seat counts through 10', () => {
    render(<InspectorHarness />);

    fireEvent.mouseDown(screen.getByLabelText('fields.seatCount'));

    expect(screen.getByRole('option', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'labels.seatCountCustom' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '11' })).not.toBeInTheDocument();
  });

  it('accepts an exact custom seat count between 11 and 100', () => {
    render(<InspectorHarness />);

    fireEvent.mouseDown(screen.getByLabelText('fields.seatCount'));
    fireEvent.click(screen.getByRole('option', { name: 'labels.seatCountCustom' }));

    const customInput = screen.getByLabelText('fields.customSeatCount');
    expect(customInput).toHaveValue(11);
    expect(customInput).toHaveAttribute('min', '11');
    expect(customInput).toHaveAttribute('max', '100');

    fireEvent.change(customInput, { target: { value: '24' } });
    expect(customInput).toHaveValue(24);
    expect(screen.getByTestId('seat-count')).toHaveTextContent('24');

    fireEvent.change(customInput, { target: { value: '101' } });
    expect(customInput).toHaveValue(100);
  });
});
