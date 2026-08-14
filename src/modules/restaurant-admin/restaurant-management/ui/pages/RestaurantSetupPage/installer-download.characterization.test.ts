// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadFiscalDriveService, downloadLocalAgentInstaller } from './installer-download';

describe('Local Agent installer download contract', () => {
  const fetchMock = vi.fn();
  const downloadedFileNames: string[] = [];
  const clickMock = vi.fn(function (this: HTMLAnchorElement) {
    downloadedFileNames.push(this.download);
  });
  const createObjectURLMock = vi.fn(() => 'blob:local-agent-installer');
  const revokeObjectURLMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    downloadedFileNames.length = 0;
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: createObjectURLMock,
        revokeObjectURL: revokeObjectURLMock,
      }),
    );
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(clickMock);
    fetchMock.mockResolvedValue(new Response(new Blob(['setup']), { status: 200 }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('fetches the generic same-origin setup and saves it with the restaurant code', async () => {
    await downloadLocalAgentInstaller('NhhgND');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(requestUrl.pathname).toBe('/downloads/CafePostcodeAgentSetup.exe');
    expect(requestUrl.searchParams.get('download')).toMatch(/^\d+$/);
    expect(requestInit).toEqual({ cache: 'no-store', credentials: 'same-origin' });

    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(downloadedFileNames).toEqual(['CafePostcodeAgentSetup-NhhgND.exe']);
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:local-agent-installer');
  });

  it('does not create or click a download when the setup request fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 502 }));

    await expect(downloadLocalAgentInstaller('NhhgND')).rejects.toThrow('Local Agent installer HTTP 502');
    expect(createObjectURLMock).not.toHaveBeenCalled();
    expect(clickMock).not.toHaveBeenCalled();
  });

  it('downloads the shared Fiscal Drive Service archive with its versioned file name', async () => {
    await downloadFiscalDriveService();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(requestUrl.pathname).toBe('/downloads/FiscalDriveService-10.2.4.zip');
    expect(requestInit).toEqual({ cache: 'no-store', credentials: 'same-origin' });

    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(downloadedFileNames).toEqual(['FiscalDriveService-10.2.4.zip']);
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:local-agent-installer');
  });
});
