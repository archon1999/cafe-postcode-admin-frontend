import { afterEach, describe, expect, it, vi } from 'vitest';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: getMock,
    })),
  },
}));

import { getMxikDetails, getMxikPrimaryPictureUrl, searchMxik, searchMxikByBarcode } from './mxikClient';

afterEach(() => {
  getMock.mockReset();
});

describe('searchMxikByBarcode', () => {
  it('uses GTIN rather than MXIK code and preserves leading zeroes', async () => {
    const item = { mxikCode: '02208001001549004', mxikName: 'Product', internationalCode: '0012345678901' };
    getMock.mockResolvedValueOnce({ data: { success: true, data: { content: [item, item] } } });
    const controller = new AbortController();
    const result = await searchMxikByBarcode(' 0012345678901 ', 'ru', controller.signal);
    expect(getMock).toHaveBeenCalledWith('mxik/search/by-params', {
      params: { gtin: '0012345678901', size: 100, lang: 'ru' },
      signal: controller.signal,
    });
    expect(result).toHaveLength(1);
    expect(result[0].raw).toEqual(item);
  });

  it('does not query invalid or incomplete input', async () => {
    expect(await searchMxikByBarcode('123')).toEqual([]);
    expect(await searchMxikByBarcode('abc')).toEqual([]);
    expect(getMock).not.toHaveBeenCalled();
  });

  it('distinguishes no match from a provider error', async () => {
    getMock.mockResolvedValueOnce({ data: { success: true, data: { content: [] } } });
    expect(await searchMxikByBarcode('00123456')).toEqual([]);
    getMock.mockResolvedValueOnce({ data: { success: false } });
    await expect(searchMxikByBarcode('00123456')).rejects.toThrow();
  });
});

describe('searchMxik', () => {
  it('searches MXIK codes directly through the public API', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: {
          content: [
            {
              mxikCode: '02202002006000000',
              mxikName: 'Mors',
            },
          ],
        },
      },
    });

    const result = await searchMxik({ query: '02202002006000000', lang: 'ru', limit: 2 });

    expect(getMock).toHaveBeenCalledWith('mxik/search/by-params', {
      params: {
        mxikCode: '02202002006000000',
        size: 2,
        lang: 'ru',
      },
    });
    expect(result).toEqual([
      {
        code: '02202002006000000',
        name: 'Mors',
        label: '02202002006000000 - Mors',
        raw: {
          mxikCode: '02202002006000000',
          mxikName: 'Mors',
        },
      },
    ]);
  });

  it('searches text queries directly through the public API and normalizes fallback names', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: {
          content: [
            {
              mxikCode: '00701001001000000',
              subPositionName: 'Kartoshka',
              positionName: 'Sabzavotlar',
            },
          ],
        },
      },
    });

    const result = await searchMxik({ query: 'kartoshka', lang: 'uz' });

    expect(getMock).toHaveBeenCalledWith('mxik/search-symbol', {
      params: {
        search_text: 'kartoshka',
        size: 20,
        lang: 'uz',
      },
    });
    expect(result[0]).toMatchObject({
      code: '00701001001000000',
      name: 'Kartoshka / Sabzavotlar',
      label: '00701001001000000 - Kartoshka / Sabzavotlar',
    });
  });

  it('does not call MXIK API for blank queries', async () => {
    await expect(searchMxik({ query: '   ' })).resolves.toEqual([]);

    expect(getMock).not.toHaveBeenCalled();
  });

  it('loads MXIK details with package, label, and cash sale metadata', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        mxikCode: '02202002006000000',
        mxikName: 'Mors',
        shortName: 'Mors',
        label: 1,
        useCard: 0,
        unitName: null,
        commonUnitName: null,
        packages: [
          {
            code: 1378885,
            name: 'litr',
            unitName: 'litr',
            parentCode: null,
            isUnitPackage: '1',
          },
          {
            code: 1860960,
            name: '2 litr',
            unitName: 'dona',
            parentCode: 1378885,
            isUnitPackage: '2',
          },
        ],
      },
    });
    getMock.mockResolvedValueOnce({
      data: {
        data: [
          {
            mxik: '02202002006000000',
            name: 'Mors',
            cashSale: 2,
            label: 1,
            packages: [
              {
                code: 1378885,
                nameLat: 'litr',
                packageType: '1',
              },
            ],
          },
        ],
      },
    });

    const result = await getMxikDetails('02202002006000000', 'uz');

    expect(getMock).toHaveBeenNthCalledWith(1, 'mxik/get/by-mxik', {
      params: {
        mxikCode: '02202002006000000',
        lang: 'uz_latn',
      },
    });
    expect(getMock).toHaveBeenNthCalledWith(2, 'integration-mxik/get/information', {
      params: {
        page: 0,
        size: 25,
        search_text: '02202002006000000',
        type: 1,
      },
    });
    expect(result).toMatchObject({
      code: '02202002006000000',
      name: 'Mors',
      shortName: 'Mors',
      unitName: '',
      commonUnitName: '',
      useCard: 0,
      cashSale: 2,
      labelStatus: 1,
      primaryPackage: {
        code: '1378885',
        name: 'litr',
        unitName: 'litr',
        containerName: '',
        parentCode: '',
        isUnitPackage: '1',
        raw: {
          code: 1378885,
          name: 'litr',
          unitName: 'litr',
          parentCode: null,
          isUnitPackage: '1',
        },
      },
      packages: [
        {
          code: '1378885',
          name: 'litr',
          unitName: 'litr',
          containerName: '',
          parentCode: '',
          isUnitPackage: '1',
          raw: {
            code: 1378885,
            name: 'litr',
            unitName: 'litr',
            parentCode: null,
            isUnitPackage: '1',
          },
        },
        {
          code: '1860960',
          name: '2 litr',
          unitName: 'dona',
          containerName: '',
          parentCode: '1378885',
          isUnitPackage: '2',
          raw: {
            code: 1860960,
            name: '2 litr',
            unitName: 'dona',
            parentCode: 1378885,
            isUnitPackage: '2',
          },
        },
      ],
      raw: {
        mxikCode: '02202002006000000',
        mxikName: 'Mors',
        shortName: 'Mors',
        label: 1,
        useCard: 0,
        cashSale: 2,
        unitName: null,
        commonUnitName: null,
        packages: [
          {
            code: 1378885,
            name: 'litr',
            unitName: 'litr',
            parentCode: null,
            isUnitPackage: '1',
          },
          {
            code: 1860960,
            name: '2 litr',
            unitName: 'dona',
            parentCode: 1378885,
            isUnitPackage: '2',
          },
        ],
      },
    });
    expect(result?.raw).toMatchObject({
      mxikCode: '02202002006000000',
      mxik: '02202002006000000',
      cashSale: 2,
    });
  });

  it('loads the primary MXIK image URL directly through the public API', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        value: ['00709001906000000_1.png', '00709001906000000_2.png'],
      },
    });

    const result = await getMxikPrimaryPictureUrl('00709001906000000', 'uz');

    expect(getMock).toHaveBeenCalledWith('integration-mxik/references/get/mxik/picture-names', {
      params: {
        mxik_code: '00709001906000000',
        lang: 'uz_cyrl',
      },
    });
    expect(result).toBe(
      'https://tasnif.soliq.uz/api/cls-api/integration-mxik/references/get/file/00709001906000000_1.png',
    );
  });
});
