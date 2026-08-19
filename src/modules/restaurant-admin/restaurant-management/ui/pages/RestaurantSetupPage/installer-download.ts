const DEFAULT_INSTALLER_URL = '/downloads/CafePostcodeAgentSetup.exe';
const FISCAL_DRIVE_SERVICE_URL = '/downloads/FiscalDriveService-10.2.4.zip';
const FISCAL_DRIVE_SERVICE_FILE_NAME = 'FiscalDriveService-10.2.4.zip';

async function downloadFile(url: URL, fileName: string, errorLabel: string) {
  const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`${errorLabel} HTTP ${response.status}`);
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function localAgentInstallerFileName() {
  return 'CafePostcodeAgentSetup.exe';
}

export async function downloadLocalAgentInstaller() {
  const configuredUrl = String(import.meta.env.VITE_LOCAL_AGENT_INSTALLER_URL || '').trim();
  const installerUrl = new URL(configuredUrl || DEFAULT_INSTALLER_URL, window.location.origin);
  installerUrl.searchParams.set('download', String(Date.now()));

  await downloadFile(installerUrl, localAgentInstallerFileName(), 'Local Agent installer');
}

export async function downloadFiscalDriveService() {
  const serviceUrl = new URL(FISCAL_DRIVE_SERVICE_URL, window.location.origin);
  await downloadFile(serviceUrl, FISCAL_DRIVE_SERVICE_FILE_NAME, 'Fiscal Drive Service');
}
