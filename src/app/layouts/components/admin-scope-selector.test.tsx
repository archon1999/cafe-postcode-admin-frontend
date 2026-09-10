/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminScopeSelector } from './admin-scope-selector';

const state = vi.hoisted(() => ({
  selectedRestaurantId: null as string | null,
  setSelectedRestaurantId: vi.fn(),
  invalidateQueries: vi.fn(),
  t: (key: string) => key,
  data: [
    { id: 'lima', name: 'LIMA MASKANI' },
    { id: 'other', name: 'Other cafe' },
    { id: 'cyrillic', name: 'ОЛМОС КАФЕ' },
  ],
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: state.t }),
}));
vi.mock('modules/auth', () => ({
  useCurrentUser: () => ({ profile: { isSuperuser: true } }),
  useAdminScopeStore: <T,>(selector: (value: typeof state) => T) => selector(state),
}));
vi.mock('shared/api', () => ({ queryClient: { invalidateQueries: state.invalidateQueries } }));
vi.mock('modules/business-partner/restaurants/application', () => ({
  useGetRestaurantsQuery: () => ({
    isLoading: false,
    data: state.data,
  }),
}));

beforeEach(() => {
  state.selectedRestaurantId = null;
  vi.clearAllMocks();
});
afterEach(cleanup);

describe('AdminScopeSelector', () => {
  it.each(['lima', 'LiMa', 'LIMA', ' maskani '])(
    'finds a branch using %s without changing scope while typing',
    (search) => {
      render(<AdminScopeSelector />);
      fireEvent.focus(screen.getByRole('combobox'));
      fireEvent.change(screen.getByRole('combobox'), { target: { value: search } });
      expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe(search);
      expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['LIMA MASKANI']);
      expect(state.setSelectedRestaurantId).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('option', { name: 'LIMA MASKANI' }));
      expect(state.setSelectedRestaurantId).toHaveBeenCalledWith('lima');
      expect(state.invalidateQueries).toHaveBeenCalledOnce();
    },
  );

  it('matches Cyrillic letters without case sensitivity', () => {
    render(<AdminScopeSelector />);
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'олмос' } });
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['ОЛМОС КАФЕ']);
  });

  it('returns to all branches when the selection is cleared', () => {
    state.selectedRestaurantId = 'lima';
    render(<AdminScopeSelector />);
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.click(screen.getByTitle('Clear'));
    expect(state.setSelectedRestaurantId).toHaveBeenCalledWith(null);
    expect(state.invalidateQueries).toHaveBeenCalledOnce();
  });
});
