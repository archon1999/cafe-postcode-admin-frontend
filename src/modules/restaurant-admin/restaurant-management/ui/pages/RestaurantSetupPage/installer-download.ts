const DEFAULT_INSTALLER_URL = '/downloads/CafePostcodeAgentSetup.exe';
const RESTAURANT_CODE_PATTERN = /^[A-Za-z0-9]{6}$/;

export function localAgentInstallerFileName(restaurantCode: string) {
  const code = restaurantCode.trim();
  if (!RESTAURANT_CODE_PATTERN.test(code)) {
    throw new Error('Invalid restaurant auth code.');
  }
  return `CafePostcodeAgentSetup-${code}.exe`;
}

export async function downloadLocalAgentInstaller(restaurantCode: string) {
  const configuredUrl = String(import.meta.env.VITE_LOCAL_AGENT_INSTALLER_URL || '').trim();
  const installerUrl = new URL(configuredUrl || DEFAULT_INSTALLER_URL, window.location.origin);
  installerUrl.searchParams.set('download', String(Date.now()));
  const response = await fetch(installerUrl, { cache: 'no-store', credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Local Agent installer HTTP ${response.status}`);
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = localAgentInstallerFileName(restaurantCode);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
