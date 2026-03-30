/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { EMPTY_VALUE_TEST_ID } from 'shared/ui/EmptyValue';

import { createColumn, withDetailLink } from './columnUtils';

afterEach(() => {
  cleanup();
});

describe('withDetailLink', () => {
  it('wraps a non-empty cell value with a router link', () => {
    const column = withDetailLink(
      createColumn<{ id: string; username: string }>('username', 'Username'),
      (row) => `/users/${row.id}`,
    );

    render(
      <MemoryRouter>
        {column.renderCell?.({
          field: 'username',
          row: { id: 'user-1', username: 'alice' },
          value: 'alice',
          formattedValue: 'alice',
        } as never)}
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/users/user-1');
  });

  it('keeps empty values unlinked', () => {
    const column = withDetailLink(
      createColumn<{ id: string; username: string }>('username', 'Username'),
      (row) => `/users/${row.id}`,
    );

    render(
      <MemoryRouter>
        {column.renderCell?.({
          field: 'username',
          row: { id: 'user-1', username: '' },
          value: '',
          formattedValue: '',
        } as never)}
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByTestId(EMPTY_VALUE_TEST_ID)).toBeInTheDocument();
  });
});
