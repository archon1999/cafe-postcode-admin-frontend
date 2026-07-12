import { describe, expect, it } from 'vitest';

import { localAgentInstallerFileName } from './installer-download';

describe('localAgentInstallerFileName', () => {
  it('embeds the one-time enrollment token for zero-input setup', () => {
    expect(localAgentInstallerFileName('cpe_abcdefghijklmnopqrstuvwxyz1234', 'http://127.0.0.1:8000')).toBe(
      'CafePostcodeAgentSetup-aHR0cDovLzEyNy4wLjAuMTo4MDAw--cpe_abcdefghijklmnopqrstuvwxyz1234.exe',
    );
  });

  it('rejects unsafe file-name input', () => {
    expect(() => localAgentInstallerFileName('cpe_bad/../token', 'https://cafe-postcode.uz')).toThrow(
      'Invalid Local Agent enrollment token.',
    );
  });
});
