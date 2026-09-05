import { adminScopeStore, currentUserStore } from 'modules/auth/domain';

import { instance } from './axiosInstance';

type Command = { commandId: string; paymentId: string; payload: '{}'; origin: string };
type Status<T> = { commandId: string; state: string; responseStatus?: number; response?: T; retryAllowed?: boolean };
const flights = new Map<string, Promise<unknown>>();

function scope(paymentId: string) {
  const user = currentUserStore.getState().currentUser;
  const restaurant = user?.isSuperuser ? adminScopeStore.getState().selectedRestaurantId : user?.restaurantId;
  if (!user?.id || !restaurant)
    throw new Error('Moliyaviy amal uchun foydalanuvchi va restoran tanlangan bo‘lishi kerak.');
  return `cafe-admin.fiscal-command.v1:${JSON.stringify([instance.defaults.baseURL, restaurant, user.id, paymentId])}`;
}

function failure(command: Command, state: string, body?: unknown) {
  const data = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const detail =
    typeof data.detail === 'string'
      ? data.detail
      : state === 'failed'
        ? 'Fiskal amal bajarilmadi.'
        : 'Fiskal amal natijasi noma’lum. Yangi amal yuborilmadi; asl Local Agentdagi natijani tekshiring.';
  return Object.assign(new Error(detail), {
    response: { data: { ...data, detail, state, commandId: command.commandId } },
  });
}

async function lookup<T>(command: Command): Promise<Status<T> | null> {
  try {
    const { data } = await instance.get<Status<T>>(
      `/api/v1/admin/billing/financial-commands/${encodeURIComponent(command.commandId)}/`,
    );
    if (data.commandId !== command.commandId || !['processing', 'succeeded', 'failed', 'unknown'].includes(data.state))
      throw new Error();
    return data;
  } catch (error) {
    const response = (error as { response?: { status?: number; data?: { code?: string } } }).response;
    if (response?.status === 404 && response.data?.code === 'FINANCIAL_COMMAND_NOT_FOUND') return null;
    throw failure(command, 'unknown');
  }
}

async function recover<T>(key: string, command: Command): Promise<T> {
  const status = await lookup<T>(command);
  if (
    status?.state === 'succeeded' &&
    status.response &&
    status.responseStatus &&
    status.responseStatus >= 200 &&
    status.responseStatus < 300
  ) {
    localStorage.removeItem(key);
    return status.response;
  }
  if (status?.state === 'failed') {
    localStorage.removeItem(key);
    throw failure(command, 'failed', status.response);
  }
  throw failure(command, 'unknown', status?.response);
}

export async function durableFiscalRetry<T>(paymentId: string, recoverOnly = false): Promise<T | null> {
  const key = scope(paymentId);
  if (flights.has(key)) return flights.get(key) as Promise<T | null>;
  const work = async () => {
    const raw = localStorage.getItem(key);
    if (raw) {
      let command: Command;
      try {
        command = JSON.parse(raw) as Command;
        if (
          !command.commandId ||
          command.paymentId !== paymentId ||
          command.payload !== '{}' ||
          command.origin !== (instance.defaults.baseURL ?? '')
        )
          throw new Error();
      } catch {
        throw new Error('Saqlangan fiskal amal buzilgan. Administrator tekshiruvi kerak; yangi amal yuborilmadi.');
      }
      return recover<T>(key, command);
    }
    if (recoverOnly) return null;
    const command: Command = {
      commandId: `admin:${crypto.randomUUID()}`,
      paymentId,
      payload: '{}',
      origin: instance.defaults.baseURL ?? '',
    };
    // This exact response establishes that the backend supports the durable
    // command API. A legacy/proxy 404 must never authorize a raw fiscal retry.
    if (await lookup(command)) throw failure(command, 'unknown');
    try {
      localStorage.setItem(key, JSON.stringify(command));
    } catch {
      throw new Error('Fiskal amalni qurilmada saqlab bo‘lmadi. Amal yuborilmadi.');
    }
    try {
      const { data } = await instance.post<T>(
        `/api/v1/admin/billing/payments/${paymentId}/retry-fiscal/`,
        {},
        { headers: { 'X-Edge-Operation-ID': command.commandId } },
      );
      localStorage.removeItem(key);
      return data;
    } catch (error) {
      const body = (error as { response?: { data?: { code?: string; financialCommand?: { state?: string } } } })
        .response?.data;
      if (
        body?.financialCommand?.state === 'failed' ||
        [
          'FINANCIAL_OWNER_UPGRADE_REQUIRED',
          'FINANCIAL_COMMAND_ID_REQUIRED',
          'FINANCIAL_RETRY_CASHIER_UNAVAILABLE',
        ].includes(body?.code ?? '')
      ) {
        localStorage.removeItem(key);
        throw failure(command, 'failed', body);
      }
      return recover<T>(key, command);
    }
  };
  const promise = navigator.locks?.request ? navigator.locks.request(key, work) : work();
  flights.set(key, promise);
  try {
    return await promise;
  } finally {
    flights.delete(key);
  }
}
