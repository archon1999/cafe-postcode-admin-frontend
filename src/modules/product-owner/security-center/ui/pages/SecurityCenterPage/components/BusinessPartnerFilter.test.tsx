// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BusinessPartnerFilter } from './BusinessPartnerFilter';

const mocks = vi.hoisted(() => ({
  partners: [
    {
      id: 'partner-1',
      inn: '100000001',
      companyName: 'Partner One',
      legalName: 'Partner One',
      directorName: '',
      phone: '',
      email: '',
      address: '',
      status: 'active' as const,
      customTariffAllowed: false,
      restaurants: [{ id: 'restaurant-1', name: 'Branch One' }],
    },
  ],
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: (key: string) => key }),
}));

vi.mock('modules/product-owner/business-partners/application', () => ({
  useGetBusinessPartnersListQuery: () => ({
    data: { data: mocks.partners },
    isLoading: false,
  }),
}));

afterEach(cleanup);

describe('BusinessPartnerFilter', () => {
  it('offers an all option and returns the selected business partner', () => {
    const onChange = vi.fn();
    render(<BusinessPartnerFilter value={null} onChange={onChange} />);

    const select = screen.getByRole('combobox', { name: 'controlCenter.businessPartnerFilter' });
    expect(select).toHaveTextContent('controlCenter.allBusinessPartners');

    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByRole('option', { name: 'Partner One' }));

    expect(onChange).toHaveBeenCalledWith(mocks.partners[0]);
  });
});
