import { afterEach, describe, expect, it, vi } from 'vitest';

const { detailsMock } = vi.hoisted(() => ({ detailsMock: vi.fn() }));
vi.mock('./mxikClient', () => ({ getMxikDetails: detailsMock }));

import { resolveCatalogMxikPayload } from './catalogMxikPayload';

afterEach(() => detailsMock.mockReset());

describe('resolveCatalogMxikPayload', () => {
  it('persists Tasnif packages missing from search metadata', async () => {
    const packages = [{ code: 1378885, unitName: 'litr', isUnitPackage: '1' }];
    detailsMock.mockResolvedValue({ code: '02202002006000000', raw: { packages, cashSale: 2 } });
    await expect(
      resolveCatalogMxikPayload('02202002006000000', {
        mxikCode: '02202002006000000',
        barcode: '001234',
        packages: [],
      }),
    ).resolves.toEqual({ mxikCode: '02202002006000000', barcode: '001234', packages, cashSale: 2 });
  });

  it('keeps existing package metadata without another Tasnif request', async () => {
    const raw = { packages: [{ code: '001234' }] };
    await expect(resolveCatalogMxikPayload('02202002006000000', raw)).resolves.toBe(raw);
    expect(detailsMock).not.toHaveBeenCalled();
  });

  it('does not attach classification from a different MXIK', async () => {
    detailsMock.mockResolvedValue({ code: 'other', raw: { packages: [{ code: 1378885 }] } });
    await expect(resolveCatalogMxikPayload('02202002006000000', { barcode: '001234' })).resolves.toEqual({
      barcode: '001234',
    });
  });

  it('clears classification when MXIK is removed', async () => {
    await expect(resolveCatalogMxikPayload('', { packages: [{ code: 1378885 }] })).resolves.toEqual({});
    expect(detailsMock).not.toHaveBeenCalled();
  });

  it('does not silently save incomplete data when Tasnif is unavailable', async () => {
    detailsMock.mockRejectedValue(new Error('Tasnif unavailable'));
    await expect(resolveCatalogMxikPayload('02202002006000000')).rejects.toThrow('Tasnif unavailable');
  });
});
