import { isAxiosError } from 'axios';

import { instance } from 'shared/api/http/axiosInstance';

import { FeeAuthoringError, type FeePolicy, type ServiceFeesRepository } from '../../domain';

const root = '/api/v1/admin/restaurants/service-fees';
type PolicyDTO = Omit<FeePolicy, 'isActive'> & { is_active: boolean };
const policy = ({ is_active, ...rest }: PolicyDTO): FeePolicy => ({ ...rest, isActive: is_active });

async function request<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const data = error.response.data;
      const diagnostic = data?.errors?.[0];
      const message = diagnostic?.message ?? data?.detail ?? data?.message;
      throw new FeeAuthoringError(typeof message === 'string' ? message : JSON.stringify(data), diagnostic?.position);
    }
    throw error;
  }
}

export const serviceFeesRepository: ServiceFeesRepository = {
  catalog: () =>
    request(async () => {
      const { data } = await instance.get(`${root}/catalog/`);
      return { ...data, defaultTimezone: data.default_timezone, aiAvailable: data.ai_available };
    }),
  policies: () =>
    request(async () => {
      const { data } = await instance.get<PolicyDTO[]>(`${root}/policies/`);
      return data.map(policy);
    }),
  assignments: () =>
    request(async () => {
      const { data } = await instance.get(`${root}/assignments/`);
      return data.map((row: { hall_name: string | null; hourly_rate: number }) => ({
        ...row,
        hallName: row.hall_name,
        hourlyRate: row.hourly_rate,
      }));
    }),
  preview: (definition, context) =>
    request(async () => {
      const { data } = await instance.post(`${root}/preview/`, {
        definition,
        context: {
          subtotal: context.subtotal,
          guest_count: context.guestCount,
          started_at: context.startedAt,
          calculated_at: context.calculatedAt,
        },
      });
      return {
        definition: data.definition,
        amount: data.result.amount,
        exact: data.result.exact,
        durationMinutes: data.result.duration_minutes,
        timeDependent: data.result.time_dependent,
        bindings: data.result.bindings,
      };
    }),
  save: (input) =>
    request(async () => {
      const body = {
        name: input.name,
        definition: input.definition,
        is_active: input.isActive,
        expected_revision: input.expectedRevision,
      };
      const { data } = input.id
        ? await instance.patch<PolicyDTO>(`${root}/policies/${input.id}/`, body)
        : await instance.post<PolicyDTO>(`${root}/policies/`, body);
      return policy(data);
    }),
  assign: (input) =>
    request(async () => {
      await instance.post(`${root}/assignments/`, {
        scope: input.scope,
        target_id: input.targetId,
        mode: input.mode,
        percent: input.percent,
        formula: input.formula,
        policy_id: input.policyId,
        expected_revision: input.expectedRevision,
      });
    }),
  draft: (text, timezone) =>
    request(async () => {
      const { data } = await instance.post(`${root}/ai-draft/`, { text, timezone }, { timeout: 65000 });
      return data;
    }),
};
