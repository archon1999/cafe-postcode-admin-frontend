/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PrintTemplateBlock } from '../../../../domain';

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}));

import { PrintBlockEditor } from './PrintBlockEditor';

const selectedVariable = 'order.number';

const lineBlock: PrintTemplateBlock = {
  id: 'lines',
  type: 'items_table',
  rows: [{ label: 'Subtotal', value: '{{totals.subtotal}}' }],
  columns: [{ label: 'Product', value: '{{item.name}}' }],
};

afterEach(() => {
  cleanup();
});

function chooseVariable() {
  const comboboxes = screen.getAllByRole('combobox');
  fireEvent.mouseDown(comboboxes[comboboxes.length - 1]);
  fireEvent.click(screen.getByRole('option', { name: /order\.number/ }));
}

function renderEditor(block: PrintTemplateBlock) {
  const onChange = vi.fn();
  render(<PrintBlockEditor block={block} variables={[selectedVariable]} onChange={onChange} />);
  return onChange;
}

describe('PrintBlockEditor variable insertion', () => {
  it('appends the selected variable to a text block', () => {
    const block: PrintTemplateBlock = { id: 'text', type: 'text', text: 'Receipt' };
    const onChange = renderEditor(block);

    chooseVariable();

    expect(onChange).toHaveBeenCalledWith({ ...block, text: 'Receipt {{order.number}}' });
  });

  it('appends the selected variable to a QR value', () => {
    const block: PrintTemplateBlock = { id: 'qr', type: 'qr', value: 'https://receipt/' };
    const onChange = renderEditor(block);

    chooseVariable();

    expect(onChange).toHaveBeenCalledWith({ ...block, value: 'https://receipt/ {{order.number}}' });
  });

  it('appends the selected variable to a row label', () => {
    const onChange = renderEditor(lineBlock);
    fireEvent.focus(screen.getAllByLabelText('fields.label')[0]);

    chooseVariable();

    expect(onChange).toHaveBeenCalledWith({
      ...lineBlock,
      rows: [{ label: 'Subtotal {{order.number}}', value: '{{totals.subtotal}}' }],
    });
  });

  it('appends the selected variable to a row value', () => {
    const onChange = renderEditor(lineBlock);
    fireEvent.focus(screen.getAllByLabelText('fields.value')[0]);

    chooseVariable();

    expect(onChange).toHaveBeenCalledWith({
      ...lineBlock,
      rows: [{ label: 'Subtotal', value: '{{totals.subtotal}} {{order.number}}' }],
    });
  });

  it('appends the selected variable to a column label', () => {
    const onChange = renderEditor(lineBlock);
    fireEvent.focus(screen.getAllByLabelText('fields.label')[1]);

    chooseVariable();

    expect(onChange).toHaveBeenCalledWith({
      ...lineBlock,
      columns: [{ label: 'Product {{order.number}}', value: '{{item.name}}' }],
    });
  });

  it('appends the selected variable to a column value', () => {
    const onChange = renderEditor(lineBlock);
    fireEvent.focus(screen.getAllByLabelText('fields.value')[1]);

    chooseVariable();

    expect(onChange).toHaveBeenCalledWith({
      ...lineBlock,
      columns: [{ label: 'Product', value: '{{item.name}} {{order.number}}' }],
    });
  });
});
