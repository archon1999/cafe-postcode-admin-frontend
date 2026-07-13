import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import { navData } from './nav-config-dashboard';

describe('restaurant admin navigation', () => {
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
