/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getMoneySuffix } from 'shared/utils/format-money';

import { RHFSumCurrencyField, type RHFSumCurrencyFieldProps } from './RhfSumCurrencyField';

vi.mock('shared/utils/format-money', async (importOriginal) => {
  const actual = await importOriginal<typeof import('shared/utils/format-money')>();

  return { ...actual, getMoneySuffix: () => 'SUM' };
});

type CurrencyForm = {
  amount: number | '';
};

function renderCurrencyField(props: Omit<RHFSumCurrencyFieldProps<CurrencyForm>, 'name'> = {}) {
  const TestForm = () => {
    const methods = useForm<CurrencyForm>({ defaultValues: { amount: '' } });

    return (
      <FormProvider {...methods}>
        <RHFSumCurrencyField<CurrencyForm> name="amount" label="Amount" {...props} />
      </FormProvider>
    );
  };

  return render(<TestForm />);
}

describe('RHFSumCurrencyField input adornment', () => {
  afterEach(cleanup);

  it('renders the currency suffix without caller input slot props', () => {
    renderCurrencyField();

    expect(screen.getByText(getMoneySuffix())).toBeInTheDocument();
  });

  it('renders an object input adornment before the currency suffix', () => {
    renderCurrencyField({
      slotProps: {
        input: { endAdornment: <span data-testid="caller-adornment" /> },
      },
    });

    const callerAdornment = screen.getByTestId('caller-adornment');
    const currencyAdornment = screen.getByText(getMoneySuffix());

    expect(callerAdornment.compareDocumentPosition(currencyAdornment) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('does not invoke a callback input slot prop in the current composition', () => {
    let callbackCalls = 0;

    renderCurrencyField({
      slotProps: {
        input: () => {
          callbackCalls += 1;
          return { endAdornment: <span data-testid="callback-adornment" /> };
        },
      },
    });

    expect(callbackCalls).toBe(0);
    expect(screen.queryByTestId('callback-adornment')).not.toBeInTheDocument();
    expect(screen.getByText(getMoneySuffix())).toBeInTheDocument();
  });
});
