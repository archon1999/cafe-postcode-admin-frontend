import { describe, expect, it } from 'vitest';

import { getUsersGridActionKeys } from './users-grid.actions';

describe('getUsersGridActionKeys', () => {
  it('adds change pin only for editable employee rows', () => {
    expect(
      getUsersGridActionKeys({
        surface: 'employee',
        canEditEmployee: true,
        canChangePin: true,
        employmentStatus: 'active',
      }),
    ).toEqual(['view', 'edit', 'change-pin', 'archive']);
  });

  it('omits employee edit affordances without employees.update', () => {
    expect(
      getUsersGridActionKeys({
        surface: 'employee',
        canEditEmployee: false,
        canChangePin: false,
        employmentStatus: 'active',
      }),
    ).toEqual(['view', 'archive']);
  });

  it('omits change pin for employee rows without POS access', () => {
    expect(
      getUsersGridActionKeys({
        surface: 'employee',
        canEditEmployee: true,
        canChangePin: false,
        employmentStatus: 'active',
      }),
    ).toEqual(['view', 'edit', 'archive']);
  });

  it('never adds change pin for system users', () => {
    expect(
      getUsersGridActionKeys({
        surface: 'user',
        canEditEmployee: false,
        canChangePin: false,
        employmentStatus: 'active',
      }),
    ).toEqual(['view', 'edit', 'archive']);
  });
});
