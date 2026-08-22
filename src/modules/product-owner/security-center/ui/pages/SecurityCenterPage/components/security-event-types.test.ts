import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import ruSecurity from 'app/providers/locales/langs/ru/security-center.json';
import uzSecurity from 'app/providers/locales/langs/uz/security-center.json';
import uzCyrlSecurity from 'app/providers/locales/langs/uz-Cyrl/security-center.json';

import { getSecurityEventLabel, getSecurityEventResultLabel, SECURITY_EVENT_TYPES } from './security-event-types';

const resources = [uzSecurity, uzCyrlSecurity, ruSecurity] as const;

describe('security event labels', () => {
  it.each(resources)('translates every event type offered by the exact server filter', (security) => {
    SECURITY_EVENT_TYPES.forEach((eventType) => {
      expect(security.eventTypes[eventType.toLocaleLowerCase() as keyof typeof security.eventTypes]).toBeTruthy();
    });
  });

  it('uses the localized label and safely falls back to an unknown raw event type', () => {
    const translations: Record<string, string> = {
      'eventTypes.pin_failed': 'Noto‘g‘ri PIN kiritildi',
      'eventResults.denied': 'Rad etildi',
    };
    const t = ((key: string, options?: { defaultValue?: string }) =>
      translations[key] ?? options?.defaultValue ?? key) as TFunction;

    expect(getSecurityEventLabel(t, 'PIN_FAILED')).toBe('Noto‘g‘ri PIN kiritildi');
    expect(getSecurityEventLabel(t, 'FUTURE_SECURITY_EVENT')).toBe('FUTURE_SECURITY_EVENT');
    expect(getSecurityEventResultLabel(t, 'DENIED')).toBe('Rad etildi');
    expect(getSecurityEventResultLabel(t, 'FUTURE_RESULT')).toBe('FUTURE_RESULT');
  });
});
