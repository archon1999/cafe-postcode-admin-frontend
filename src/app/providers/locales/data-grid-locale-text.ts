import type { GridLocaleText } from '@mui/x-data-grid';

import type { LangCode } from './locales-config';

const baseLocaleText: Partial<GridLocaleText> = {
  noRowsLabel: 'No rows',
  noResultsOverlayLabel: 'No results found.',
  toolbarColumns: 'Columns',
  toolbarFilters: 'Filters',
  toolbarExport: 'Export',
  toolbarExportCSV: 'Download as CSV',
  toolbarExportPrint: 'Print',
  toolbarQuickFilterLabel: 'Search',
  toolbarQuickFilterPlaceholder: 'Search...',
  columnsManagementSearchTitle: 'Search',
  columnsManagementNoColumns: 'No columns',
  columnsManagementShowHideAllText: 'Show/Hide all',
  columnsManagementReset: 'Reset',
};

const pageRangeSeparator = '\u2013';

const localeByLang: Record<LangCode, Partial<GridLocaleText>> = {
  uz: {
    ...baseLocaleText,
    noRowsLabel: "Ma'lumot topilmadi",
    noResultsOverlayLabel: 'Natija topilmadi',
    toolbarColumns: 'Ustunlar',
    toolbarFilters: 'Filtrlar',
    toolbarExport: 'Eksport',
    toolbarExportCSV: 'CSV yuklash',
    toolbarExportPrint: 'Chop etish',
    toolbarQuickFilterLabel: 'Qidiruv',
    toolbarQuickFilterPlaceholder: 'Qidirish...',
    columnsManagementSearchTitle: 'Ustunlarni qidirish',
    columnsManagementNoColumns: 'Ustun topilmadi',
    columnsManagementShowHideAllText: "Barchasini ko'rsatish/yashirish",
    columnsManagementReset: 'Tiklash',
    paginationRowsPerPage: 'Har sahifada:',
    paginationDisplayedRows: ({ from, to, count }) =>
      `${from}${pageRangeSeparator}${to} / ${count === -1 ? to : count}`,
  },
  'uz-Cyrl': {
    ...baseLocaleText,
    noRowsLabel:
      '\u041c\u0430\u044a\u043b\u0443\u043c\u043e\u0442 \u0442\u043e\u043f\u0438\u043b\u043c\u0430\u0434\u0438',
    noResultsOverlayLabel:
      '\u041d\u0430\u0442\u0438\u0436\u0430 \u0442\u043e\u043f\u0438\u043b\u043c\u0430\u0434\u0438',
    toolbarColumns: '\u0423\u0441\u0442\u0443\u043d\u043b\u0430\u0440',
    toolbarFilters: '\u0424\u0438\u043b\u0442\u0440\u043b\u0430\u0440',
    toolbarExport: '\u042d\u043a\u0441\u043f\u043e\u0440\u0442',
    toolbarExportCSV: 'CSV \u044e\u043a\u043b\u0430\u0448',
    toolbarExportPrint: '\u0427\u043e\u043f \u044d\u0442\u0438\u0448',
    toolbarQuickFilterLabel: '\u049a\u0438\u0434\u0438\u0440\u0443\u0432',
    toolbarQuickFilterPlaceholder: '\u049a\u0438\u0434\u0438\u0440\u0438\u0448...',
    columnsManagementSearchTitle:
      '\u0423\u0441\u0442\u0443\u043d\u043b\u0430\u0440\u043d\u0438 \u049b\u0438\u0434\u0438\u0440\u0438\u0448',
    columnsManagementNoColumns: '\u0423\u0441\u0442\u0443\u043d \u0442\u043e\u043f\u0438\u043b\u043c\u0430\u0434\u0438',
    columnsManagementShowHideAllText:
      '\u0411\u0430\u0440\u0447\u0430\u0441\u0438\u043d\u0438 \u043a\u045e\u0440\u0441\u0430\u0442\u0438\u0448/\u044f\u0448\u0438\u0440\u0438\u0448',
    columnsManagementReset: '\u0422\u0438\u043a\u043b\u0430\u0448',
    paginationRowsPerPage: '\u04b2\u0430\u0440 \u0441\u0430\u04b3\u0438\u0444\u0430\u0434\u0430:',
    paginationDisplayedRows: ({ from, to, count }) =>
      `${from}${pageRangeSeparator}${to} / ${count === -1 ? to : count}`,
  },
  ru: {
    ...baseLocaleText,
    noRowsLabel: '\u0414\u0430\u043d\u043d\u044b\u0435 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b',
    noResultsOverlayLabel:
      '\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e',
    toolbarColumns: '\u041a\u043e\u043b\u043e\u043d\u043a\u0438',
    toolbarFilters: '\u0424\u0438\u043b\u044c\u0442\u0440\u044b',
    toolbarExport: '\u042d\u043a\u0441\u043f\u043e\u0440\u0442',
    toolbarExportCSV: '\u0421\u043a\u0430\u0447\u0430\u0442\u044c CSV',
    toolbarExportPrint: '\u041f\u0435\u0447\u0430\u0442\u044c',
    toolbarQuickFilterLabel: '\u041f\u043e\u0438\u0441\u043a',
    toolbarQuickFilterPlaceholder: '\u041f\u043e\u0438\u0441\u043a...',
    columnsManagementSearchTitle: '\u041f\u043e\u0438\u0441\u043a \u043a\u043e\u043b\u043e\u043d\u043e\u043a',
    columnsManagementNoColumns:
      '\u041a\u043e\u043b\u043e\u043d\u043a\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b',
    columnsManagementShowHideAllText:
      '\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c/\u0441\u043a\u0440\u044b\u0442\u044c \u0432\u0441\u0435',
    columnsManagementReset: '\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c',
    paginationRowsPerPage:
      '\u0421\u0442\u0440\u043e\u043a \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435:',
    paginationDisplayedRows: ({ from, to, count }) =>
      `${from}${pageRangeSeparator}${to} \u0438\u0437 ${count === -1 ? to : count}`,
  },
};

export function getDataGridLocaleText(lang: LangCode) {
  return localeByLang[lang] ?? localeByLang.uz;
}
