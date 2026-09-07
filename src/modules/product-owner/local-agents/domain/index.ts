export type SupportParameter = {
  name: string;
  label: string;
  required: boolean;
  maxLength: number;
  options?: string[];
};

export type SupportCommand = {
  name: string;
  label: string;
  mutating: boolean;
  runtimeRequired: boolean;
  timeoutSeconds: number;
  parameters: SupportParameter[];
};

export type SupportRequest = { requestId: string; name: string; parameters: Record<string, string> };
export class SupportCommandRejected extends Error {}
export type SupportRecord = SupportRequest & {
  status: string;
  transportStatus: string;
  result: Record<string, unknown>;
  error: unknown;
  createdAt: string;
  completedAt: string | null;
  requestedBy: string | null;
};

export interface AgentSupportRepository {
  catalog(): Promise<{ commands: SupportCommand[] }>;
  history(agentId: string): Promise<{ commands: SupportRecord[] }>;
  status(agentId: string, requestId: string): Promise<SupportRecord>;
  execute(agentId: string, request: SupportRequest): Promise<SupportRecord>;
}

export function isSupportCommandPending(status?: string) {
  return Boolean(status && ['pending', 'sent', 'running', 'timed_out'].includes(status));
}
