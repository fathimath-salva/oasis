export type AuthFailureKind = 'email_unconfirmed' | 'invalid_credentials' | 'network' | 'rate_limited' | 'configuration' | 'unknown';
export type AuthOperation = 'signin' | 'registration' | 'resend' | 'profile' | 'signout' | 'password_reset';

interface AuthErrorLike {
  code?: unknown;
  message?: unknown;
  name?: unknown;
  status?: unknown;
}

const readError = (error: unknown): AuthErrorLike =>
  typeof error === 'object' && error !== null ? error as AuthErrorLike : {};

export function classifyAuthFailure(error: unknown): AuthFailureKind {
  const authError = readError(error);
  const code = typeof authError.code === 'string' ? authError.code.toLowerCase() : '';
  const message = typeof authError.message === 'string' ? authError.message.toLowerCase() : '';
  const name = typeof authError.name === 'string' ? authError.name.toLowerCase() : '';
  const status = typeof authError.status === 'number' ? authError.status : undefined;

  if (code === 'email_not_confirmed' || /email (is )?not confirmed/.test(message)) return 'email_unconfirmed';
  if (['invalid_api_key', 'bad_jwt', 'redirect_not_allowed', 'redirect_to_not_allowed'].includes(code)
    || status === 404
    || /invalid api key|redirect.*(allow|allowlist|not allowed|invalid)/.test(message)) return 'configuration';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || status === 429) return 'rate_limited';
  if (['invalid_credentials', 'invalid_grant', 'user_not_found'].includes(code)
    || /invalid login credentials|invalid credentials/.test(message)
    || message.trim() === 'invalid') return 'invalid_credentials';
  if (name.includes('retryablefetch') || name.includes('network') || status === 0 || (status !== undefined && status >= 500)
    || /fetch failed|failed to fetch|network error|network request|load failed|timed? ?out|connection refused/.test(message)) {
    return 'network';
  }
  return 'unknown';
}

export function authFailureMessage(kind: AuthFailureKind, operation: AuthOperation): string {
  if (kind === 'email_unconfirmed') {
    return 'This email has not been confirmed. Use the link sent to your inbox, or request another confirmation email.';
  }
  if (kind === 'invalid_credentials') return 'Email or password is incorrect. Check both and try again.';
  if (kind === 'network') return operation === 'password_reset'
    ? 'We could not reach the password recovery service. Check your connection and try again.'
    : 'We could not reach the sign-in service. Check your connection and try again.';
  if (kind === 'rate_limited') return 'Too many attempts were made. Wait a little while, then try again.';
  if (kind === 'configuration') return operation === 'password_reset'
    ? 'The password recovery email configuration needs attention. Please contact the salon.'
    : 'The sign-in or email-link configuration needs attention. Please contact the salon.';
  if (operation === 'registration') return 'We could not create the account. Check your details and try again.';
  if (operation === 'resend') return 'We could not process the resend request. Please wait and try again.';
  if (operation === 'profile') return 'We could not save your account details. Please try again.';
  if (operation === 'signout') return 'We could not sign you out. Please try again.';
  return 'We could not complete sign-in. Please try again.';
}

export const confirmationResendMessage =
  'If this address has an account awaiting confirmation, check your inbox and spam folder for a new link. If none arrives, check the address or contact the salon.';
