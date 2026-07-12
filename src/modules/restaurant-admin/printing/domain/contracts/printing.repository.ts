import type {
  CreatePrintTemplateVersionPayload,
  PrintPresetCatalog,
  PrintTemplateVersion,
  RestaurantPrintTemplate,
} from '../entities';

export interface PrintingRepository {
  getTemplates(): Promise<RestaurantPrintTemplate[]>;
  getPresetCatalog(): Promise<PrintPresetCatalog>;
  createVersion(templateId: string, payload: CreatePrintTemplateVersionPayload): Promise<PrintTemplateVersion>;
  publishVersion(templateId: string, versionId: string): Promise<PrintTemplateVersion>;
}
