import { describe, expect, it } from 'vitest';

import { localAgentInstallerFileName } from './installer-download';

describe('localAgentInstallerFileName', () => {
  it('uses one generic installer because restaurant binding happens through QR pairing', () => {
    expect(localAgentInstallerFileName()).toBe('CafePostcodeAgentSetup.exe');
  });
});
