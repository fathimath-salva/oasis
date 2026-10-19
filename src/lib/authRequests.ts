export type LoginRequestPhase = 'signin' | 'session' | 'profile';

export class AuthRequestTimeoutError extends Error {
  readonly code = 'auth_request_timeout';
  readonly phase: LoginRequestPhase;

  constructor(phase: LoginRequestPhase) {
    super(`The ${phase} request timed out.`);
    this.name = 'AuthRequestTimeoutError';
    this.phase = phase;
  }
}

export const AUTH_REQUEST_TIMEOUT_MS = 15_000;
export const LOGIN_STAGE_TIMEOUT_MS = 17_000;

/** Bound a promise even when a storage lock or a custom transport never settles. */
export async function withAuthRequestTimeout<T>(
  operation: () => Promise<T>,
  phase: LoginRequestPhase,
  timeoutMs = LOGIN_STAGE_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new AuthRequestTimeoutError(phase)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** The global Supabase transport timeout aborts fetch itself, preventing a late
 * HTTP response from being parsed and saved as a session after the UI timed out. */
export function createTimeoutFetch(
  fetchImplementation: typeof fetch,
  timeoutMs = AUTH_REQUEST_TIMEOUT_MS,
): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const requestSignal = typeof Request !== 'undefined' && input instanceof Request ? input.signal : null;
    const sourceSignal = init?.signal ?? requestSignal;
    let timedOut = false;
    const abortFromSource = () => controller.abort(sourceSignal?.reason);
    if (sourceSignal?.aborted) abortFromSource();
    else sourceSignal?.addEventListener('abort', abortFromSource, { once: true });
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    try {
      return await fetchImplementation(input, { ...init, signal: controller.signal });
    } catch (error) {
      if (timedOut) throw new AuthRequestTimeoutError('signin');
      throw error;
    } finally {
      clearTimeout(timer);
      sourceSignal?.removeEventListener('abort', abortFromSource);
    }
  };
}

export function loginTimeoutMessage(phase: LoginRequestPhase): string {
  if (phase === 'signin') return 'Sign-in is taking too long. Check your connection and try again.';
  if (phase === 'session') return 'We could not confirm your sign-in session in time. Please try again.';
  return 'Sign-in succeeded, but the salon could not verify your profile in time. No dashboard access was granted. Check your connection and try again.';
}

export async function withLoadingState<T>(
  setLoading: (loading: boolean) => void,
  operation: () => Promise<T>,
  shouldUpdate: () => boolean = () => true,
): Promise<T> {
  setLoading(true);
  try {
    return await operation();
  } finally {
    if (shouldUpdate()) setLoading(false);
  }
}
