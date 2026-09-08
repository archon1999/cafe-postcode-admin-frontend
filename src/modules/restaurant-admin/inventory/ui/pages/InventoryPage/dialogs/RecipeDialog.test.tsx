// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RecipeDialog } from './RecipeDialog';

vi.mock('../../../shared/InventorySection', () => ({}));
vi.mock('app/providers/locales', () => ({ useTranslate: () => ({ t: (key: string) => key }) }));
vi.mock('../../../../application', () => ({
  useInventoryReference: (resource: string) => ({
    data:
      resource === 'catalogOptions'
        ? [
            { id: 'tea', name: 'Tea', categoryId: 'drinks', categoryName: 'Drinks', modifierOptions: [] },
            { id: 'soup', name: 'Soup', categoryId: 'food', categoryName: 'Food', modifierOptions: [] },
            { id: 'coffee', name: 'Coffee', categoryId: 'drinks', categoryName: 'Drinks', modifierOptions: [] },
            { id: 'water', name: 'Water', categoryId: null, categoryName: '', modifierOptions: [] },
          ]
        : [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useInventoryCommands: () => ({ saveRecipe: { mutateAsync: vi.fn(), isPending: false } }),
}));

describe('recipe catalog search', () => {
  afterEach(cleanup);
  it('groups interleaved products once and searches by product or category', async () => {
    render(<RecipeDialog onClose={vi.fn()} />);
    const product = screen.getByRole('combobox', { name: /fields.catalogItem/ });
    fireEvent.focus(product);
    fireEvent.mouseDown(product);
    expect(within(screen.getByRole('listbox')).getAllByText('Drinks')).toHaveLength(1);
    fireEvent.change(product, { target: { value: 'drinks' } });
    await waitFor(() =>
      expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Coffee', 'Tea']),
    );
    fireEvent.change(product, { target: { value: 'soup' } });
    fireEvent.click(screen.getByRole('option', { name: 'Soup' }));
    expect((product as HTMLInputElement).value).toBe('Soup');
    fireEvent.change(product, { target: { value: 'water' } });
    expect(within(screen.getByRole('listbox')).getByText('uncategorized')).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Water' })).toBeTruthy();
  });
});
