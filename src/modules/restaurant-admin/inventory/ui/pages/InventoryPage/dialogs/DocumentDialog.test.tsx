// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InventoryDocument } from '../../../../domain';

import { DocumentDialog } from './DocumentDialog';

const mocks = vi.hoisted(() => ({ save: vi.fn(), post: vi.fn(), canPost: true, canViewCost: true }));
vi.mock('../../../shared/InventorySection', () => ({}));
vi.mock('app/providers/locales', () => ({ useTranslate: () => ({ t: (key: string) => key }) }));
vi.mock('modules/auth/domain/services/current-user', () => ({
  useCurrentUser: () => ({ profile: { fullName: 'Manager' } }),
}));
vi.mock('../../../../application', () => ({
  useInventoryAccess: () => ({ canPost: mocks.canPost, canViewCost: mocks.canViewCost }),
  useInventoryReference: (resource: string) => ({
    data:
      resource === 'items'
        ? [{ id: 'egg', name: 'Egg', baseUnit: 'piece', purchaseUnit: 'tray', purchaseFactor: '30', isActive: true }]
        : [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useInventoryCommands: () => ({
    saveDocument: { mutateAsync: mocks.save, isPending: false },
    postDocument: { mutateAsync: mocks.post, isPending: false },
    uploadAttachment: { mutateAsync: vi.fn(), isPending: false },
  }),
}));
const count = {
  id: 'count-1',
  number: 'COUNT-1',
  kind: 'stocktake',
  warehouse: 'warehouse-1',
  supplier: null,
  reference: 'COUNT-1',
  responsibleName: 'Manager',
  reason: 'Weekly count',
  occurredAt: '2026-09-06T10:00:00Z',
  attachmentUrl: '',
  notes: '',
  lines: [
    {
      id: 'line-1',
      item: 'egg',
      quantity: null,
      inputUnit: 'base',
      lotNumber: '',
      expiresOn: null,
      expectedQuantity: '30',
    },
  ],
} as InventoryDocument;

describe('stocktake editor', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.canPost = true;
    mocks.canViewCost = true;
    mocks.save.mockResolvedValue({ ...count, id: 'count-1' });
    mocks.post.mockResolvedValue({ ...count, status: 'posted' });
  });
  it('saves an unfinished count as null while preventing approval until explicit zero is entered', async () => {
    const onSaved = vi.fn();
    render(<DocumentDialog warehouse="warehouse-1" initial={count} onClose={vi.fn()} onSaved={onSaved} />);
    expect((screen.getByLabelText('fields.actualQuantity') as HTMLInputElement).value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'stocktake.approve' }));
    expect(await screen.findByText('validation.quantity')).toBeTruthy();
    expect(mocks.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'saveDraft' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(mocks.save.mock.calls[0][0].payload.lines[0].quantity).toBeNull();
    expect(mocks.post).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('fields.actualQuantity'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'stocktake.approve' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('count-1'));
    expect(mocks.save.mock.calls[1][0].payload.lines[0].quantity).toBe('0');
  });
  it('hides posting affordance without posting permission', () => {
    mocks.canPost = false;
    render(<DocumentDialog warehouse="warehouse-1" initial={count} onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'stocktake.approve' })).toBeNull();
    expect(screen.getByRole('button', { name: 'saveDraft' })).toBeTruthy();
  });
  it('does not expose a receipt cost input to staff without cost permission', () => {
    mocks.canViewCost = false;
    render(<DocumentDialog warehouse="warehouse-1" onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.queryByLabelText('fields.unitCost')).toBeNull();
    expect(screen.queryByLabelText('fields.attachmentUrl')).toBeNull();
    expect(screen.getByText('costRestrictedReceipt')).toBeTruthy();
  });
  it('preserves an existing attachment while costless staff edit other draft fields', async () => {
    mocks.canViewCost = false;
    const attachmentUrl = 'https://example.com/invoice.pdf';
    render(
      <DocumentDialog
        warehouse="warehouse-1"
        initial={{ ...count, attachmentUrl }}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText('fields.attachmentUrl')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'saveDraft' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(mocks.save.mock.calls[0][0].payload.attachmentUrl).toBe(attachmentUrl);
  });
});
