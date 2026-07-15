import { describe, expect, it } from 'vitest';

import { roleFormSchema, toRolePayload } from './roleForm';

describe('roleForm boundary', () => {
  it('defaults omitted permission IDs to an empty assignment payload', () => {
    const values = roleFormSchema.parse({
      name: '  Kassir  ',
      description: '  Kassa huquqlari  ',
    });

    expect(toRolePayload(values)).toEqual({
      name: 'Kassir',
      description: 'Kassa huquqlari',
      permissionIds: [],
    });
  });

  it('preserves selected permission IDs in the assignment payload', () => {
    const values = roleFormSchema.parse({
      name: 'Manager',
      description: undefined,
      permissionIds: ['orders.view', 'orders.update'],
    });

    expect(toRolePayload(values)).toEqual({
      name: 'Manager',
      description: '',
      permissionIds: ['orders.view', 'orders.update'],
    });
  });
});
