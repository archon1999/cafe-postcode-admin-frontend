export interface FormulaDefinition {
  version?: number;
  name: string;
  source: string;
  parameters: Record<string, string>;
  timezone: string;
  revision?: string;
  program?: unknown;
  policy_id?: string;
  policy_revision?: string;
}

export interface FeePolicy {
  id: string;
  name: string;
  definition: FormulaDefinition;
  isActive: boolean;
  revision: string;
}

export interface FeeCatalog {
  templates: { id: string; name: string; source: string; parameters: Record<string, string> }[];
  variables: { name: string; type: string }[];
  functions: { name: string; signature: string; description: string }[];
  defaultTimezone: string;
  aiAvailable: boolean;
}

export interface FeeContext {
  subtotal: number;
  guestCount: number;
  startedAt: string;
  calculatedAt: string;
}

export interface FeePreview {
  definition: FormulaDefinition;
  amount: number;
  exact: string;
  durationMinutes: string;
  timeDependent: boolean;
  bindings: { name: string; value: string }[];
}

export interface FeeAssignment {
  scope: 'restaurant' | 'hall' | 'table';
  id: string;
  name: string;
  hallName: string | null;
  enabled: boolean;
  mode: string;
  percent: string;
  hourlyRate: number;
  formula: Partial<FormulaDefinition>;
}

export interface FeeDraft {
  definition: FormulaDefinition | null;
  explanation: string;
  questions: string[];
}

export interface PolicyInput {
  id?: string;
  name: string;
  definition: FormulaDefinition;
  isActive: boolean;
  expectedRevision?: string;
}

export interface AssignmentInput {
  scope: FeeAssignment['scope'];
  targetId: string;
  mode: 'none' | 'percentage' | 'formula';
  percent?: string;
  formula?: Record<string, unknown>;
  policyId?: string | null;
  expectedRevision?: string;
}

export interface ServiceFeesRepository {
  catalog(): Promise<FeeCatalog>;
  policies(): Promise<FeePolicy[]>;
  assignments(): Promise<FeeAssignment[]>;
  preview(definition: FormulaDefinition, context: FeeContext): Promise<FeePreview>;
  save(input: PolicyInput): Promise<FeePolicy>;
  assign(input: AssignmentInput): Promise<void>;
  draft(text: string, timezone: string): Promise<FeeDraft>;
}

export class FeeAuthoringError extends Error {
  constructor(
    message: string,
    public position?: number,
  ) {
    super(message);
  }
}

export { buildFormula, type BuilderOptions } from './builder';
