import { useEffect } from 'react';

import { CONFIG } from 'app/config/globalConfig';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

export function buildControlPairingRedirect(controlAppUrl: string, hash: string, origin: string) {
  let base: URL;
  try {
    base = new URL(controlAppUrl, origin);
  } catch {
    base = new URL('/control/', origin);
  }
  base.pathname = `${base.pathname.replace(/\/+$/, '')}/pair`;
  base.search = '';
  base.hash = hash.startsWith('#') ? hash : '';
  return base.toString();
}

export default function LegacyPairingRedirectPage() {
  useEffect(() => {
    window.location.replace(
      buildControlPairingRedirect(CONFIG.controlAppUrl, window.location.hash, window.location.origin),
    );
  }, []);

  return <LoadingScreen />;
}
