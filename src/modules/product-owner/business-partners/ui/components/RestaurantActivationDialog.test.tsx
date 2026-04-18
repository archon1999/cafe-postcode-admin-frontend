/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}));

import { RestaurantActivationDialog } from './RestaurantActivationDialog';

afterEach(() => {
  cleanup();
});

describe('RestaurantActivationDialog', () => {
  it('shows custom price fields when custom activation is selected', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RestaurantActivationDialog
          open
          tariffs={[]}
          roles={[
            {
              id: 'role-1',
              code: 'restaurant_admin',
              name: 'Restaurant admin',
              description: '',
              isSystem: true,
              permissions: [],
            },
          ]}
          permissions={[]}
          isSubmitting={false}
          onClose={() => {}}
          onSubmit={vi.fn().mockResolvedValue(undefined)}
        />
      </LocalizationProvider>,
    );

    fireEvent.click(screen.getByLabelText('labels.customActivation'));

    expect(screen.getByLabelText('fields.monthlyPrice')).toBeInTheDocument();
    expect(screen.getByLabelText('fields.yearlyPrice')).toBeInTheDocument();
  });
});
