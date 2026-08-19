// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import { getSafeAdminReturnTarget, getSafeAdminReturnTo } from './safe-return-to';

describe('getSafeAdminReturnTo', () => {
  it('preserves the pairing fragment without exposing it as a server query', () => {
    expect(getSafeAdminReturnTo('/pair#v=1&pairingId=id&claimToken=secret')).toBe(
      '/pair#v=1&pairingId=id&claimToken=secret',
    );
  });

  it('keeps a pairing claim in the URL fragment while returnTo contains only the path', () => {
    expect(getSafeAdminReturnTarget('/pair', '#v=1&pairingId=id&claimToken=secret')).toBe(
      '/pair#v=1&pairingId=id&claimToken=secret',
    );
  });

  it.each(['https://evil.example/', '//evil.example/', 'javascript:alert(1)', null])(
    'rejects external return target %s',
    (value) => expect(getSafeAdminReturnTo(value)).toBeNull(),
  );
});
