import { describe, expect, it } from 'vitest';

import ru from 'app/providers/locales/langs/ru/inventory.json';
import uz from 'app/providers/locales/langs/uz/inventory.json';
import cyrl from 'app/providers/locales/langs/uz-Cyrl/inventory.json';

function flatten(value: Record<string, unknown>, prefix = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, content]) =>
      typeof content === 'string'
        ? [[`${prefix}${key}`, content]]
        : Object.entries(flatten(content as Record<string, unknown>, `${prefix}${key}.`)),
    ),
  );
}
describe('inventory translations', () => {
  const source = flatten(uz);
  it.each([ru, cyrl])('has complete keys and preserves interpolation variables', (resource) => {
    const translated = flatten(resource);
    expect(Object.keys(translated).sort()).toEqual(Object.keys(source).sort());
    for (const key of Object.keys(source)) {
      expect(translated[key].trim()).not.toBe('');
      expect((translated[key].match(/\{\{.*?\}\}/g) || []).sort()).toEqual(
        (source[key].match(/\{\{.*?\}\}/g) || []).sort(),
      );
    }
  });
});
