/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { RestaurantDetailLinkCell } from './RestaurantDetailLinkCell';

describe('RestaurantDetailLinkCell', () => {
  it('renders restaurant name as a detail link', () => {
    render(
      <MemoryRouter>
        <RestaurantDetailLinkCell id="restaurant-1" name="Alpha Cafe" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Alpha Cafe' })).toHaveAttribute(
      'href',
      '/business-partner/restaurants/restaurant-1',
    );
  });
});
