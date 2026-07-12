const DEFAULT_INSTALLER_URL = '/downloads/CafePostcodeAgentSetup.exe';
const ENROLLMENT_TOKEN_PATTERN = /^cpe_[A-Za-z0-9_-]{20,}$/;

function encodeBackendUrl(backendUrl: string) {
  const normalized = new URL(backendUrl).origin;
  return btoa(normalized).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function localAgentInstallerFileName(enrollmentToken: string, backendUrl: string) {
  const token = enrollmentToken.trim();
  if (!ENROLLMENT_TOKEN_PATTERN.test(token)) {
    throw new Error('Invalid Local Agent enrollment token.');
  }
  return `CafePostcodeAgentSetup-${encodeBackendUrl(backendUrl)}--${token}.exe`;
}

export async function downloadLocalAgentInstaller(enrollmentToken: string, backendUrl: string) {
  const configuredUrl = String(import.meta.env.VITE_LOCAL_AGENT_INSTALLER_URL || '').trim();
  const response = await fetch(configuredUrl || DEFAULT_INSTALLER_URL, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Local Agent installer HTTP ${response.status}`);
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = localAgentInstallerFileName(enrollmentToken, backendUrl);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
