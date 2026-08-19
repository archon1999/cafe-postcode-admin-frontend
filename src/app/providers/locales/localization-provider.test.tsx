// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalizationProvider } from './localization-provider';

const mocks = vi.hoisted(() => ({
  adapterLocale: 'ru',
  language: 'ru',
}));

vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('./use-locales', () => ({
  useTranslate: () => ({
    currentLang: {
      adapterLocale: mocks.adapterLocale,
      value: mocks.language,
    },
  }),
}));

beforeEach(() => {
  mocks.adapterLocale = 'ru';
  mocks.language = 'ru';
  document.documentElement.lang = 'test-default';
});

afterEach(() => {
  cleanup();
  document.documentElement.lang = '';
});

describe('LocalizationProvider document language', () => {
  it('syncs the canonical active language and restores the prior value on cleanup', () => {
    const view = render(
      <LocalizationProvider>
        <div>localized content</div>
      </LocalizationProvider>,
    );

    expect(screen.getByText('localized content')).toBeVisible();
    expect(document.documentElement.lang).toBe('ru');

    mocks.adapterLocale = 'uz';
    mocks.language = 'uz-Cyrl';
    view.rerender(
      <LocalizationProvider>
        <div>localized content</div>
      </LocalizationProvider>,
    );
    expect(document.documentElement.lang).toBe('uz-Cyrl');

    view.unmount();
    expect(document.documentElement.lang).toBe('test-default');
  });
});
