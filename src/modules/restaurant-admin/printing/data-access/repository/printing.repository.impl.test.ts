import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrintTemplateLayout, PrintTemplateVersion } from '../../domain';

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock('shared/api/http/axiosInstance', () => ({
  instance: { get: getMock, post: postMock },
}));

import { printingRepository } from './printing.repository.impl';

const fiscalLayout: PrintTemplateLayout = {
  schemaVersion: 1,
  paperWidthMm: 80,
  blocks: [
    { id: 'title', type: 'text', text: '{{restaurant.name}}', align: 'center', bold: true },
    { id: 'qr', type: 'qr', value: '{{fiscal.qrUrl}}', align: 'center', qrScale: 2, locked: true },
    { id: 'feed', type: 'feed', lines: 2 },
    { id: 'cut', type: 'cut' },
  ],
};

const plainLayout: PrintTemplateLayout = {
  schemaVersion: 1,
  paperWidthMm: 80,
  blocks: [
    { id: 'title', type: 'text', text: '{{restaurant.name}}' },
    { id: 'feed', type: 'feed', lines: 2 },
    { id: 'cut', type: 'cut' },
  ],
};

const kitchenLayout: PrintTemplateLayout = {
  schemaVersion: 1,
  paperWidthMm: 80,
  blocks: [
    {
      id: 'items',
      type: 'items_table',
      columns: [
        { label: 'Nomi', value: '{{item.name}}', grow: 1 },
        { label: 'Soni', value: 'x{{item.quantity}}', align: 'right' },
      ],
    },
    { id: 'feed', type: 'feed', lines: 2 },
    { id: 'cut', type: 'cut' },
  ],
};

beforeEach(() => {
  getMock.mockReset();
  postMock.mockReset();
});

describe('printingRepository schema-1 compatibility', () => {
  it('normalizes camel-case kind keys without changing persisted layouts', async () => {
    const apiCatalog = {
      presets: [
        {
          key: 'legacy_80',
          name: 'Legacy',
          paperWidthMm: 80,
          templates: {
            kitchenTicket: kitchenLayout,
            paymentReceiptPlain: plainLayout,
            paymentReceiptFiscal: fiscalLayout,
          },
        },
      ],
      variableGroups: [{ key: 'fiscal', label: 'Fiskal' }],
      variablesByKind: {
        kitchenTicket: ['item.name'],
        paymentReceiptPlain: ['totals.total'],
        paymentReceiptFiscal: ['fiscal.qrUrl'],
      },
      sampleData: { fiscal: { qrUrl: 'https://ofd.soliq.uz/check?q=704' } },
    };
    getMock.mockResolvedValue({ data: apiCatalog });

    const catalog = await printingRepository.getPresetCatalog();

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/printing/presets/');
    expect(catalog.variablesByKind).toEqual({
      kitchen_ticket: ['item.name'],
      payment_receipt_plain: ['totals.total'],
      payment_receipt_fiscal: ['fiscal.qrUrl'],
    });
    expect(catalog.presets[0].templates).toEqual({
      kitchen_ticket: kitchenLayout,
      payment_receipt_plain: plainLayout,
      payment_receipt_fiscal: fiscalLayout,
    });
    expect(catalog.presets[0].templates.payment_receipt_fiscal).toBe(fiscalLayout);
  });

  it('posts the complete schema-1 layout without renaming or dropping device blocks', async () => {
    const version: PrintTemplateVersion = {
      id: 'version-1',
      revision: 2,
      schemaVersion: 1,
      status: 'draft',
      presetKey: 'legacy_80',
      layout: fiscalLayout,
      createdAt: '2026-07-15T10:00:00Z',
    };
    postMock.mockResolvedValue({ data: version });
    const payload = { layout: fiscalLayout, presetKey: 'legacy_80' };

    const created = await printingRepository.createVersion('template-1', payload);

    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/printing/templates/template-1/versions/', payload);
    expect(postMock.mock.calls[0][1].layout).toBe(fiscalLayout);
    const postedBlocks = postMock.mock.calls[0][1].layout.blocks;
    expect(postedBlocks[postedBlocks.length - 2]).toEqual({ id: 'feed', type: 'feed', lines: 2 });
    expect(postedBlocks[postedBlocks.length - 1]).toEqual({ id: 'cut', type: 'cut' });
    expect(created).toBe(version);
  });
});
