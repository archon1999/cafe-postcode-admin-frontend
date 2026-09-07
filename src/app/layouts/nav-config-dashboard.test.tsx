import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import { RoutePath } from 'app/routes';

import { navData } from './nav-config-dashboard';

describe('restaurant admin navigation', () => {
  it('shows warehouse navigation only to inventory readers', () => {
    const t = ((key: string) => key) as TFunction;
    const permitted = navData(t, {
      isSuperuser: false,
      restaurantAccessActive: true,
      permissionCodes: ['admin.inventory.view'],
    });
    expect(permitted.flatMap((section) => section.items).map((item) => item.title)).toEqual(['inventory']);
    const inventory = permitted.flatMap((section) => section.items)[0];
    expect(inventory.path).toBe(RoutePath.inventoryBalances);
    expect(inventory.children?.map((item) => item.path)).toEqual([
      RoutePath.inventoryBalances,
      RoutePath.inventoryDocuments,
      RoutePath.inventoryRecipes,
      RoutePath.inventoryReports,
      RoutePath.inventoryInsights,
      RoutePath.inventoryItems,
      RoutePath.inventorySuppliers,
      RoutePath.inventoryWarehouses,
    ]);
    const denied = navData(t, { isSuperuser: false, restaurantAccessActive: true, permissionCodes: ['reports.view'] });
    expect(denied.flatMap((section) => section.items).map((item) => item.title)).not.toContain('inventory');
  });
  it('keeps my restaurant above reports and leaves operational pages under restaurant management', () => {
    const t = ((key: string) => key) as TFunction;
    const sections = navData(t, {
      isSuperuser: false,
      restaurantAccessActive: true,
      permissionCodes: [
        'restaurant_settings.view',
        'reports.view',
        'employees.view',
        'cash_desks.view',
        'prep_stations.view',
        'integration_configs.view',
        'print_templates.view',
      ],
    });
    const items = sections.flatMap((section) => section.items);

    expect(items.map((item) => item.title)).toEqual(['myRestaurant', 'reports', 'employees', 'restaurantManagement']);
    expect(items.find((item) => item.title === 'restaurantManagement')?.children?.map((item) => item.title)).toEqual([
      'cashDesks',
      'prepStations',
      'integrations',
      'printTemplates',
    ]);
  });
});
