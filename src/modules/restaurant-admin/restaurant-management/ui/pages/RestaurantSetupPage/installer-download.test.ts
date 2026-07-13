import { describe, expect, it } from 'vitest';

import { localAgentInstallerFileName } from './installer-download';

describe('localAgentInstallerFileName', () => {
  it('embeds the restaurant auth code in the installer file name', () => {
    expect(localAgentInstallerFileName('NhhgND')).toBe('CafePostcodeAgentSetup-NhhgND.exe');
  });

  it('rejects unsafe file-name input', () => {
    expect(() => localAgentInstallerFileName('../bad')).toThrow('Invalid restaurant auth code.');
  });
});
