import { instance } from 'shared/api/http/axiosInstance';

import type {
  PrintPresetCatalog,
  PrintTemplateKind,
  PrintTemplateLayout,
  PrintingRepository,
  PrintTemplateVersion,
  RestaurantPrintTemplate,
} from '../../domain';

type ApiKindMap<T> = Partial<
  Record<PrintTemplateKind | 'kitchenTicket' | 'orderPrecheck' | 'paymentReceiptPlain' | 'paymentReceiptFiscal', T>
>;

const API_KIND_KEYS: Record<PrintTemplateKind, keyof ApiKindMap<unknown>> = {
  kitchen_ticket: 'kitchenTicket',
  order_precheck: 'orderPrecheck',
  payment_receipt_plain: 'paymentReceiptPlain',
  payment_receipt_fiscal: 'paymentReceiptFiscal',
};

function readKindValue<T>(values: ApiKindMap<T>, kind: PrintTemplateKind): T | undefined {
  return values[kind] ?? values[API_KIND_KEYS[kind]];
}

function normalizePresetCatalog(catalog: PrintPresetCatalog): PrintPresetCatalog {
  const rawVariables = catalog.variablesByKind as ApiKindMap<string[]>;

  return {
    ...catalog,
    variablesByKind: {
      kitchen_ticket: readKindValue(rawVariables, 'kitchen_ticket') ?? [],
      order_precheck: readKindValue(rawVariables, 'order_precheck') ?? [],
      payment_receipt_plain: readKindValue(rawVariables, 'payment_receipt_plain') ?? [],
      payment_receipt_fiscal: readKindValue(rawVariables, 'payment_receipt_fiscal') ?? [],
    },
    presets: catalog.presets.map((preset) => {
      const rawTemplates = preset.templates as ApiKindMap<PrintTemplateLayout>;
      return {
        ...preset,
        templates: {
          kitchen_ticket: readKindValue(rawTemplates, 'kitchen_ticket')!,
          order_precheck: readKindValue(rawTemplates, 'order_precheck')!,
          payment_receipt_plain: readKindValue(rawTemplates, 'payment_receipt_plain')!,
          payment_receipt_fiscal: readKindValue(rawTemplates, 'payment_receipt_fiscal')!,
        },
      };
    }),
  };
}

export const printingRepository: PrintingRepository = {
  getTemplates() {
    return instance
      .get<RestaurantPrintTemplate[]>('/api/v1/admin/printing/templates/')
      .then((response) => response.data);
  },
  getPresetCatalog() {
    return instance
      .get<PrintPresetCatalog>('/api/v1/admin/printing/presets/')
      .then((response) => normalizePresetCatalog(response.data));
  },
  createVersion(templateId, payload) {
    return instance
      .post<PrintTemplateVersion>(`/api/v1/admin/printing/templates/${templateId}/versions/`, payload)
      .then((response) => response.data);
  },
  publishVersion(templateId, versionId) {
    return instance
      .post<PrintTemplateVersion>(`/api/v1/admin/printing/templates/${templateId}/versions/${versionId}/publish/`, {})
      .then((response) => response.data);
  },
};
