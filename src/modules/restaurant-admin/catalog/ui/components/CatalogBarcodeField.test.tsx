// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AdminMxikLookupResult } from 'shared/api/admin-types';

const { lookup } = vi.hoisted(() => ({ lookup: vi.fn() }));
vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: (key: string) => key, currentLang: { value: 'uz' } }),
}));
vi.mock('../../data-access', () => ({ catalogRepository: { searchMxikByBarcode: lookup } }));
vi.mock('./MxikAutocompleteField', () => ({
  buildMxikOption: (code: string, name: string, raw: unknown) => ({ code, name, raw, value: code, label: name }),
}));

import type { CatalogItemFormInput } from '../../data-access/catalogItemForm.schema';

import { CatalogBarcodeField } from './CatalogBarcodeField';

const pendingChanged = vi.fn();

function Harness({ submit = vi.fn() }: { submit?: () => void }) {
  const form = useForm<CatalogItemFormInput>({ defaultValues: { barcode: '', mxik: null } });
  const mxik = form.watch('mxik');
  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}>
        <CatalogBarcodeField
          disabled={false}
          onMxikNamePicked={(name) => form.setValue('nameUz', name)}
          onLookupPendingChange={pendingChanged}
        />
        <output data-testid="mxik">{mxik?.code}</output>
        <button
          type="button"
          onClick={() => form.setValue('mxik', { code: 'manual', value: 'manual', label: 'Manual' })}>
          Manual
        </button>
      </form>
    </FormProvider>
  );
}
function setup(submit?: () => void) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Harness submit={submit} />
    </QueryClientProvider>,
  );
  return screen.getByLabelText('barcode.label');
}
const item = (code: string): AdminMxikLookupResult => ({ code, name: code, label: code, raw: {} });
function scan(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, { key: 'Enter' });
}
afterEach(() => {
  cleanup();
  lookup.mockReset();
  pendingChanged.mockReset();
});

describe('CatalogBarcodeField', () => {
  it('does not treat the tail of a long marking code as a product barcode', () => {
    setup();
    for (const key of '0012345678901234567890123') fireEvent.keyDown(document.body, { key });
    fireEvent.keyDown(document.body, { key: 'Enter' });
    expect(lookup).not.toHaveBeenCalled();
  });
  it('accepts a POS-style scanner sequence when no input is focused', async () => {
    lookup.mockResolvedValue([item('global-scan')]);
    const input = setup();
    for (const key of '00123456') fireEvent.keyDown(document.body, { key });
    fireEvent.keyDown(document.body, { key: 'Enter' });
    await waitFor(() => expect(screen.getByTestId('mxik').textContent).toBe('global-scan'));
    expect((input as HTMLInputElement).value).toBe('00123456');
  });
  it('looks up manual input after typing and fills MXIK', async () => {
    lookup.mockResolvedValue([item('found')]);
    const input = setup();
    fireEvent.change(input, { target: { value: '0012345678901' } });
    expect(lookup).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('mxik').textContent).toBe('found'));
    expect(pendingChanged).toHaveBeenCalledWith(true);
    expect(pendingChanged).toHaveBeenLastCalledWith(false);
    expect(lookup.mock.calls[0][0]).toBe('0012345678901');
  });
  it('handles scanner Enter without submitting the product', async () => {
    lookup.mockResolvedValue([item('scanner')]);
    const submit = vi.fn();
    scan(setup(submit), '00123456');
    await waitFor(() => expect(screen.getByTestId('mxik').textContent).toBe('scanner'));
    expect(submit).not.toHaveBeenCalled();
  });
  it('does not overwrite a manual MXIK selected during a pending lookup', async () => {
    let resolve!: (items: AdminMxikLookupResult[]) => void;
    lookup.mockReturnValue(
      new Promise<AdminMxikLookupResult[]>((done) => {
        resolve = done;
      }),
    );
    scan(setup(), '00123456');
    await waitFor(() => expect(lookup).toHaveBeenCalled());
    fireEvent.click(screen.getByText('Manual'));
    await act(async () => {
      resolve([item('late')]);
    });
    expect(screen.getByTestId('mxik').textContent).toBe('manual');
  });
  it('ignores the previous barcode response after another scan', async () => {
    let resolve!: (items: AdminMxikLookupResult[]) => void;
    lookup.mockReturnValueOnce(
      new Promise<AdminMxikLookupResult[]>((done) => {
        resolve = done;
      }),
    );
    lookup.mockResolvedValueOnce([item('new')]);
    const input = setup();
    scan(input, '00123456');
    await waitFor(() => expect(lookup).toHaveBeenCalledTimes(1));
    scan(input, '00123457');
    await waitFor(() => expect(screen.getByTestId('mxik').textContent).toBe('new'));
    await act(async () => {
      resolve([item('old')]);
    });
    expect(screen.getByTestId('mxik').textContent).toBe('new');
  });
  it('requires an explicit choice for ambiguous barcodes', async () => {
    lookup.mockResolvedValue([item('first'), item('second')]);
    scan(setup(), '00123456');
    await screen.findByText('barcode.choose');
    expect(screen.getByTestId('mxik').textContent).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'second' }));
    expect(screen.getByTestId('mxik').textContent).toBe('second');
  });
  it('shows not found without setting an MXIK', async () => {
    lookup.mockResolvedValue([]);
    scan(setup(), '00123456');
    await screen.findByText('barcode.notFound');
    expect(screen.getByTestId('mxik').textContent).toBe('');
  });
  it('allows retrying a failed lookup', async () => {
    lookup.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([item('retry')]);
    scan(setup(), '00123456');
    fireEvent.click(await screen.findByRole('button', { name: 'barcode.retry' }));
    await waitFor(() => expect(screen.getByTestId('mxik').textContent).toBe('retry'));
  });
});
