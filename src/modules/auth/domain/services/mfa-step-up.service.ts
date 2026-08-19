export const MFA_STEP_UP_REQUEST_EVENT = 'admin:mfa-step-up-requested';

let activeStepUp: {
  promise: Promise<void>;
  resolve: () => void;
  reject: (reason?: unknown) => void;
} | null = null;

export function requestAdminMFAStepUp(): Promise<void> {
  if (activeStepUp) {
    return activeStepUp.promise;
  }
  let resolvePromise!: () => void;
  let rejectPromise!: (reason?: unknown) => void;
  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  activeStepUp = {
    promise,
    resolve: () => {
      activeStepUp = null;
      resolvePromise();
    },
    reject: (reason) => {
      activeStepUp = null;
      rejectPromise(reason);
    },
  };
  window.dispatchEvent(new CustomEvent(MFA_STEP_UP_REQUEST_EVENT));
  return promise;
}

export function completeAdminMFAStepUp(): void {
  activeStepUp?.resolve();
}

export function cancelAdminMFAStepUp(reason: unknown = new Error('MFA step-up cancelled.')): void {
  activeStepUp?.reject(reason);
}
