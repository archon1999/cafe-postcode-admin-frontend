/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { BusinessPartnerClientsCell } from '../../components/BusinessPartnerClientsCell';

afterEach(() => {
  cleanup();
});

describe('BusinessPartnerClientsCell', () => {
  it('renders a dash when partner has no restaurants', () => {
    render(<BusinessPartnerClientsCell />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders first two restaurants inline and shows the rest in a menu', async () => {
    render(
      <BusinessPartnerClientsCell
        restaurants={[
          { id: 'r1', name: 'Alpha' },
          { id: 'r2', name: 'Beta' },
          { id: 'r3', name: 'Gamma' },
        ]}
        restaurantsCount={3}
      />,
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('+1'));

    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });
});
