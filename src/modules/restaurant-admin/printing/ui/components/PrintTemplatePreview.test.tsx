/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PrintTemplateLayout } from '../../domain';

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: (key: string) => key }),
}));

import { PrintTemplatePreview } from './PrintTemplatePreview';

afterEach(cleanup);

describe('PrintTemplatePreview schema-1 semantics', () => {
  it('resolves receipt variables and keeps feed/cut device-only', () => {
    const layout: PrintTemplateLayout = {
      schemaVersion: 1,
      paperWidthMm: 80,
      blocks: [
        { id: 'title', type: 'text', text: '{{restaurant.name}}', align: 'center', bold: true },
        {
          id: 'metadata',
          type: 'metadata',
          rows: [
            { label: 'Kassir', value: '{{order.cashier}}' },
            { label: 'Yashirin', value: '{{totals.zero}}', hideZero: true },
          ],
        },
        {
          id: 'items',
          type: 'items_table',
          showNotes: true,
          showVat: true,
          vatLabel: 'QQS ({{item.vatPercent}}%)',
          vatValue: '{{item.vat}}',
          columns: [
            { label: 'Nomi', value: '{{item.name}}', grow: 1 },
            { label: 'Soni', value: 'x{{item.quantity}}', align: 'center' },
            { label: 'Summa', value: '{{item.lineTotal}}', format: 'money', align: 'right' },
          ],
        },
        { id: 'qr', type: 'qr', value: '{{fiscal.qrUrl}}', align: 'center', qrScale: 2 },
        { id: 'feed', type: 'feed', lines: 2 },
        { id: 'cut', type: 'cut' },
      ],
    };
    const sampleData = {
      restaurant: { name: 'Qamish Gamburg' },
      order: { cashier: 'Aziza' },
      items: [
        {
          name: 'Osh',
          quantity: 2,
          lineTotal: 60000,
          note: 'Piyozsiz',
          vat: 6428,
          vatPercent: 12,
        },
      ],
      totals: { zero: 0 },
      fiscal: { qrUrl: 'https://ofd.soliq.uz/check?q=704' },
    };

    render(<PrintTemplatePreview layout={layout} sampleData={sampleData} showTitle={false} />);

    expect(screen.queryByText('sections.preview')).not.toBeInTheDocument();
    expect(screen.getByText('Qamish Gamburg')).toBeInTheDocument();
    expect(screen.getByText('Kassir')).toBeInTheDocument();
    expect(screen.getByText('Aziza')).toBeInTheDocument();
    expect(screen.queryByText('Yashirin')).not.toBeInTheDocument();
    expect(screen.getByText('Osh')).toBeInTheDocument();
    expect(screen.getByText('Nomi')).toBeInTheDocument();
    expect(screen.getByText('Soni')).toBeInTheDocument();
    expect(screen.getByText('Summa')).toBeInTheDocument();
    expect(screen.getByText('x2')).toBeInTheDocument();
    expect(screen.getByText('Piyozsiz')).toBeInTheDocument();
    expect(screen.getByText('QQS (12%)')).toBeInTheDocument();
    expect(screen.getByText('preview.qr')).toBeInTheDocument();
    expect(screen.getByText('https://ofd.soliq.uz/check?q=704')).toBeInTheDocument();
    expect(screen.queryByText('feed')).not.toBeInTheDocument();
    expect(screen.queryByText('cut')).not.toBeInTheDocument();
  });
});
