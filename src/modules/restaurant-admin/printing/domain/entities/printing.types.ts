export type PrintTemplateKind = 'kitchen_ticket' | 'payment_receipt_plain' | 'payment_receipt_fiscal';

export type PrintTemplateRow = {
  label: string;
  value: string;
  format?: 'money';
  bold?: boolean;
  hideZero?: boolean;
};

export type PrintTemplateColumn = PrintTemplateRow & {
  align?: 'left' | 'center' | 'right';
  grow?: number;
};

export type PrintTemplateBlock = {
  id: string;
  type:
    | 'text'
    | 'two_column_row'
    | 'divider'
    | 'spacer'
    | 'items_table'
    | 'totals'
    | 'metadata'
    | 'qr'
    | 'logo'
    | 'feed'
    | 'cut';
  role?: string;
  text?: string;
  value?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  locked?: boolean;
  size?: 'normal' | 'large';
  qrScale?: 1 | 2;
  lines?: number;
  rows?: PrintTemplateRow[];
  columns?: PrintTemplateColumn[];
  showNotes?: boolean;
  separatorAfterEach?: boolean;
  showVat?: boolean;
  vatLabel?: string;
  vatValue?: string;
};

export type PrintTemplateLayout = {
  schemaVersion: 1;
  paperWidthMm: 80;
  blocks: PrintTemplateBlock[];
};

export type PrintTemplateVersion = {
  id: string;
  revision: number;
  schemaVersion: number;
  status: 'draft' | 'published' | 'retired';
  presetKey: string;
  layout: PrintTemplateLayout;
  createdBy?: string | null;
  publishedAt?: string | null;
  createdAt: string;
};

export type RestaurantPrintTemplate = {
  id: string;
  kind: PrintTemplateKind;
  publishedVersion: PrintTemplateVersion;
  versions: PrintTemplateVersion[];
  createdAt: string;
  updatedAt: string;
};

export type PrintPreset = {
  key: string;
  name: string;
  paperWidthMm: 80;
  templates: Record<PrintTemplateKind, PrintTemplateLayout>;
};

export type PrintPresetCatalog = {
  presets: PrintPreset[];
  variableGroups: Array<{ key: string; label: string }>;
  variablesByKind: Record<PrintTemplateKind, string[]>;
  sampleData: Record<string, unknown>;
};

export type CreatePrintTemplateVersionPayload = {
  layout?: PrintTemplateLayout;
  presetKey?: string;
};
