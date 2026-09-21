// @vitest-environment jsdom
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { act, cleanup, fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ServiceFeeFormulaInput } from './ServiceFeeFormulaInput';
const render = (ui: React.ReactNode) =>
  rtlRender(<LocalizationProvider dateAdapter={AdapterDayjs}>{ui}</LocalizationProvider>);
const actions = vi.hoisted(() => ({
  preview: { mutateAsync: vi.fn(), isPending: false },
  save: { mutateAsync: vi.fn(), isPending: false },
  draft: { reset: vi.fn(), isPending: false },
}));
vi.mock('app/providers/locales', () => ({ useTranslate: () => ({ t: (key: string) => key }) }));
vi.mock('../../application/mutations', () => ({ useFeeMutations: () => actions }));
vi.mock('../../application/queries', () => ({
  useFeeCatalog: () => ({
    catalog: {
      data: {
        templates: [],
        variables: [{ name: 'subtotal', type: 'number' }],
        functions: [],
        defaultTimezone: 'Asia/Tashkent',
        aiAvailable: true,
      },
    },
  }),
}));
const definition = {
  name: 'Internal name',
  source: 'subtotal * rate',
  timezone: 'Asia/Tashkent',
  parameters: { rate: '0.1' },
};
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  actions.preview.mutateAsync.mockImplementation(async ({ definition }) => ({ definition, amount: 100, bindings: [] }));
});
describe('formula dialog', () => {
  it('shows only the trigger inline and discards edits when closed', async () => {
    const onChange = vi.fn();
    render(<ServiceFeeFormulaInput value={definition} onChange={onChange} />);
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'serviceFees.viewFormula' }));
    expect(screen.queryByLabelText('serviceFees.name')).toBeNull();
    expect(screen.queryByLabelText('serviceFees.timezone')).toBeNull();
    fireEvent.change(screen.getByLabelText('serviceFees.source'), { target: { value: '90000' } });
    fireEvent.click(screen.getByRole('button', { name: 'serviceFees.close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'serviceFees.viewFormula' }));
    expect((screen.getByLabelText('serviceFees.source') as HTMLTextAreaElement).value).toBe(definition.source);
  });
  it('validates before applying to the parent without creating a separate policy', async () => {
    const onChange = vi.fn();
    render(<ServiceFeeFormulaInput value={definition} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'serviceFees.viewFormula' }));
    fireEvent.click(screen.getByRole('button', { name: 'serviceFees.applyFormula' }));
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ source: definition.source, parameters: definition.parameters }),
      ),
    );
    expect(actions.save.mutateAsync).not.toHaveBeenCalled();
  });
  it('does not apply a pending validation after the dialog is cancelled', async () => {
    let finish!: (value: unknown) => void;
    actions.preview.mutateAsync.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const onChange = vi.fn();
    render(<ServiceFeeFormulaInput value={definition} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'serviceFees.viewFormula' }));
    fireEvent.click(screen.getByRole('button', { name: 'serviceFees.applyFormula' }));
    fireEvent.click(screen.getByRole('button', { name: 'serviceFees.close' }));
    await act(async () => {
      finish({ definition, amount: 100, bindings: [] });
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not offer to apply the previous formula while a different draft is being authored', () => {
    render(<ServiceFeeFormulaInput value={definition} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'serviceFees.viewFormula' }));
    for (const name of ['serviceFees.ai', 'serviceFees.builder', 'serviceFees.templates']) {
      fireEvent.click(screen.getByRole('tab', { name }));
      expect(screen.queryByRole('button', { name: 'serviceFees.applyFormula' })).toBeNull();
    }
  });

  it('opens the natural-language input for a new formula', () => {
    render(<ServiceFeeFormulaInput onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'serviceFees.viewFormula' }));
    expect(screen.getByRole('textbox', { name: 'serviceFees.requirement' })).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'serviceFees.source' })).toBeNull();
  });
});
