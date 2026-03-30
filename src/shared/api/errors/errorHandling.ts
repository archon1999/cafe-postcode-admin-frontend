import { isAxiosError } from 'axios';
import { toast } from 'sonner';

export type ValidationError = {
  field: string;
  message: string;
};

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  validationErrors?: ValidationError[];
};

const ERROR_DEDUPE_WINDOW_MS = 1_000;
const recentErrorFingerprints = new Map<string, number>();

export function normalizeError(err: unknown): ApiError {
  if (isAxiosError(err)) {
    const responseData = err.response?.data as
      | {
          status?: number;
          message?: string;
          code?: string;
          detail?: string;
          errors?: unknown;
        }
      | undefined;

    const validationErrors = extractValidationErrors(responseData?.errors);

    return {
      status: responseData?.status ?? err.response?.status,
      message: responseData?.message || responseData?.detail || err.message || 'Unknown error',
      code: responseData?.code,
      details: responseData?.errors ?? responseData,
      validationErrors,
    };
  }

  if (err instanceof Error) {
    return { message: err.message };
  }

  return { message: 'Unknown error' };
}

function extractValidationErrors(errors: unknown): ValidationError[] | undefined {
  if (!errors) {
    return undefined;
  }

  if (Array.isArray(errors)) {
    const normalized = errors
      .map((error) => {
        if (typeof error === 'string') {
          return { field: 'nonFieldErrors', message: error };
        }

        if (typeof error === 'object' && error !== null && 'field' in error && 'message' in error) {
          return {
            field: String((error as ValidationError).field),
            message: String((error as ValidationError).message),
          };
        }

        return null;
      })
      .filter((error): error is ValidationError => error !== null);

    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof errors === 'object') {
    const normalized = Object.entries(errors).flatMap(([field, messages]) => {
      if (Array.isArray(messages)) {
        return messages.map((message) => ({ field, message: String(message) }));
      }

      if (typeof messages === 'string') {
        return [{ field, message: messages }];
      }

      return [];
    });

    return normalized.length > 0 ? normalized : undefined;
  }

  return undefined;
}

export function isCanceled(error: unknown) {
  return (error as { code?: string })?.code === 'ERR_CANCELED';
}

function serializeDetails(details: unknown) {
  if (details === null || details === undefined) return '';
  if (typeof details === 'string') return details;

  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}

function getErrorFingerprint(error: ApiError) {
  const validationPart = error.validationErrors?.map((item) => item.message).join('|') ?? '';

  return [error.status ?? '', error.code ?? '', error.message, validationPart, serializeDetails(error.details)].join(
    '::',
  );
}

function shouldSkipDuplicateNotification(fingerprint: string) {
  const now = Date.now();
  const lastNotifiedAt = recentErrorFingerprints.get(fingerprint);

  for (const [key, timestamp] of recentErrorFingerprints) {
    if (now - timestamp > ERROR_DEDUPE_WINDOW_MS) {
      recentErrorFingerprints.delete(key);
    }
  }

  if (lastNotifiedAt && now - lastNotifiedAt <= ERROR_DEDUPE_WINDOW_MS) {
    return true;
  }

  recentErrorFingerprints.set(fingerprint, now);
  return false;
}

export function notifyError(error: ApiError) {
  const fingerprint = getErrorFingerprint(error);
  if (shouldSkipDuplicateNotification(fingerprint)) return;

  if (error.validationErrors && error.validationErrors.length > 0) {
    const validationMessages = error.validationErrors.map((err) => `${err.message}`).join('\n');

    toast.error(error.message, {
      id: fingerprint,
      description: validationMessages,
      richColors: true,
    });
  } else {
    toast.error(error.message, {
      id: fingerprint,
      description: typeof error.details === 'object' ? JSON.stringify(error.details) : null,
      richColors: true,
    });
  }

  console.error('[RQ ERROR]', error);
}
