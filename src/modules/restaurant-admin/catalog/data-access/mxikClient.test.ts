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

import { getMxikDetails, getMxikPrimaryPictureUrl, searchMxik } from './mxikClient';

afterEach(() => {
  getMock.mockReset();
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

  it('loads MXIK details with package, label, and useCard metadata', async () => {
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

    const result = await getMxikDetails('02202002006000000', 'uz');

    expect(getMock).toHaveBeenCalledWith('mxik/get/by-mxik', {
      params: {
        mxikCode: '02202002006000000',
        lang: 'uz_latn',
      },
    });
    expect(result).toEqual({
      code: '02202002006000000',
      name: 'Mors',
      shortName: 'Mors',
      unitName: '',
      commonUnitName: '',
      useCard: 0,
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
