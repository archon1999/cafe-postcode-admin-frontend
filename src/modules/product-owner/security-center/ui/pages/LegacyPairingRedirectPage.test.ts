import { describe, expect, it } from 'vitest';

import { buildControlPairingRedirect } from './LegacyPairingRedirectPage';

describe('buildControlPairingRedirect', () => {
  it('moves a legacy fragment claim to the control PWA without putting the secret in the query', () => {
    const target = buildControlPairingRedirect(
      'https://control.cafe-postcode.uz/',
      '#v=1&pairingId=11111111-1111-4111-8111-111111111111&claimToken=one-time-secret',
      'https://admin.cafe-postcode.uz',
    );

    expect(target).toBe(
      'https://control.cafe-postcode.uz/pair#v=1&pairingId=11111111-1111-4111-8111-111111111111&claimToken=one-time-secret',
    );
    expect(new URL(target).search).toBe('');
  });

  it('supports the separate local control dev port and drops any configured query', () => {
    expect(
      buildControlPairingRedirect(
        'http://127.0.0.1:4500/control/?unsafe=1',
        '#v=1&claimToken=secret',
        'http://localhost:4200',
      ),
    ).toBe('http://127.0.0.1:4500/pair#v=1&claimToken=secret');
  });
});
