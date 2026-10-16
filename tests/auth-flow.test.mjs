import assert from 'node:assert/strict';
import test from 'node:test';
import { authFailureMessage, classifyAuthFailure, confirmationResendMessage } from '../src/lib/authErrors.ts';
import { authEmailRedirectUrl, authPasswordRedirectUrl, canUpdatePasswordFromRecovery, hasRecoveryCallback, shouldFinishRecoveryVerification, shouldReloadProfileForSession, validateNewPassword, verifiedProfileForUser } from '../src/lib/registration.ts';
import { parseAppLocation, pathForAuthRoute, pathForView } from '../src/lib/appRoutes.ts';
import { authorizeView } from '../src/lib/accessControl.ts';
import { AuthRequestTimeoutError, createTimeoutFetch, withAuthRequestTimeout, withLoadingState, loginTimeoutMessage } from '../src/lib/authRequests.ts';

test('Supabase unconfirmed-email responses get a confirmation message and resend guidance', () => {
  assert.equal(classifyAuthFailure({ code: 'email_not_confirmed', message: 'Email not confirmed' }), 'email_unconfirmed');
  assert.match(authFailureMessage('email_unconfirmed', 'signin'), /confirm/i);
  assert.match(confirmationResendMessage, /check your inbox/i);
});

test('invalid credentials remain generic and never expose provider details', () => {
  assert.equal(classifyAuthFailure({ code: 'invalid_credentials', message: 'Invalid login credentials' }), 'invalid_credentials');
  assert.equal(classifyAuthFailure({ message: 'Invalid' }), 'invalid_credentials');
  assert.equal(authFailureMessage('invalid_credentials', 'signin'), 'Email or password is incorrect. Check both and try again.');
});

test('network and Supabase configuration failures have suitable messages', () => {
  assert.equal(classifyAuthFailure(new TypeError('Failed to fetch')), 'network');
  assert.match(authFailureMessage('network', 'signin'), /connection/i);
  assert.equal(classifyAuthFailure({ code: 'invalid_api_key', message: 'Invalid API key' }), 'configuration');
  assert.equal(classifyAuthFailure({ message: 'redirect URL not allowed' }), 'configuration');
  assert.match(authFailureMessage('configuration', 'resend'), /configuration/i);
});

test('confirmation links return to the current local or deployed origin', () => {
  assert.equal(authEmailRedirectUrl('http://localhost:5173'), 'http://localhost:5173/');
  assert.equal(authEmailRedirectUrl('https://demo.example.test'), 'https://demo.example.test/');
});

test('password reset links use local development origin and the actual deployed HTTPS origin', () => {
  assert.equal(authPasswordRedirectUrl('http://localhost:5173', { isDevelopment: true }), 'http://localhost:5173/reset-password');
  assert.equal(authPasswordRedirectUrl('https://demo.example.test'), 'https://demo.example.test/reset-password');
  assert.equal(authPasswordRedirectUrl('https://preview.example.test', { configuredOrigin: 'https://demo.example.test' }), 'https://demo.example.test/reset-password');
  assert.throws(() => authPasswordRedirectUrl('http://localhost:5173'), /deployed HTTPS/i);
});

test('recovery callbacks are detected for SDK processing without treating expired links as verified', () => {
  assert.equal(hasRecoveryCallback('https://demo.example.test/reset-password#access_token=opaque&type=recovery'), true);
  assert.equal(hasRecoveryCallback('https://demo.example.test/reset-password?code=opaque'), true);
  assert.equal(hasRecoveryCallback('https://demo.example.test/reset-password?error=access_denied&error_code=otp_expired'), false);
  assert.equal(hasRecoveryCallback('https://demo.example.test/reset-password'), false);
});

test('recovery callback readiness ends for invalid links but waits for a pending recovery event', () => {
  assert.equal(shouldFinishRecoveryVerification('INITIAL_SESSION', true, false), true);
  assert.equal(shouldFinishRecoveryVerification('INITIAL_SESSION', false, false), true);
  assert.equal(shouldFinishRecoveryVerification('INITIAL_SESSION', true, true), false);
  assert.equal(shouldFinishRecoveryVerification('PASSWORD_RECOVERY', true, true), true);
});

test('password changes require a verified recovery event and a current session', () => {
  assert.equal(canUpdatePasswordFromRecovery(true, true), true);
  assert.equal(canUpdatePasswordFromRecovery(false, true), false);
  assert.equal(canUpdatePasswordFromRecovery(true, false), false);
});

test('new password validation enforces minimum length and matching confirmation', () => {
  assert.match(validateNewPassword('short', 'short') ?? '', /8 characters/);
  assert.match(validateNewPassword('long-enough', 'different') ?? '', /do not match/);
  assert.equal(validateNewPassword('long-enough', 'long-enough'), null);
});

test('dedicated auth URLs parse and dashboard URLs still resolve to guarded views', () => {
  assert.deepEqual(parseAppLocation('/admin-login'), { view: 'home', authRoute: 'admin-login' });
  assert.deepEqual(parseAppLocation('/staff-login'), { view: 'home', authRoute: 'staff-login' });
  assert.deepEqual(parseAppLocation('/forgot-password'), { view: 'home', authRoute: 'forgot-password' });
  assert.deepEqual(parseAppLocation('/reset-password'), { view: 'home', authRoute: 'reset-password' });
  assert.equal(parseAppLocation('/admin').view, 'admin-dashboard');
  assert.equal(parseAppLocation('/staff').view, 'staff-dashboard');
  assert.equal(pathForAuthRoute('admin-login'), '/admin-login');
  assert.equal(pathForView('admin-dashboard'), '/admin');
  assert.equal(pathForView('staff-dashboard'), '/staff');
});

test('sign-in role is accepted only from a profile matching the Supabase user id', () => {
  const profile = {
    id: 'user-staff-1', fullName: 'Test Staff', email: 'staff@example.test', phone: '', role: 'staff',
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  };
  const verified = verifiedProfileForUser('user-staff-1', profile);
  assert.equal(verified?.role, 'staff');
  assert.equal(verifiedProfileForUser('different-user', profile), null);
  assert.equal(verifiedProfileForUser('user-staff-1', { ...profile, role: 'owner' }), null);
  assert.equal(authorizeView('staff-dashboard', {
    isLoading: false, isAuthenticated: true, isRoleVerified: verified !== null, role: verified?.role ?? null,
  }).status, 'allowed');
});

test('verified Supabase token refreshes do not re-enter profile loading, but identity changes do', () => {
  assert.equal(shouldReloadProfileForSession('user-customer-1', 'user-customer-1'), false);
  assert.equal(shouldReloadProfileForSession('user-staff-1', 'user-customer-1'), true);
  assert.equal(shouldReloadProfileForSession(null, 'user-customer-1'), true);
  assert.equal(shouldReloadProfileForSession('user-customer-1', null), true);
});

test('a stalled login stage times out with a phase-specific error and a useful message', async () => {
  await assert.rejects(
    withAuthRequestTimeout(() => new Promise(() => {}), 'signin', 5),
    (error) => error instanceof AuthRequestTimeoutError && error.phase === 'signin',
  );
  assert.match(loginTimeoutMessage('profile'), /No dashboard access was granted/i);
});

test('aborting the Supabase fetch transport prevents a stalled request from resolving late', async () => {
  let observedAbort = false;
  const timedFetch = createTimeoutFetch((_input, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => {
      observedAbort = true;
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  }), 5);
  await assert.rejects(timedFetch('https://example.test/auth/v1/token'), AuthRequestTimeoutError);
  assert.equal(observedAbort, true);
});

test('a timed-out attempt cannot publish a later response and a retry can succeed', async () => {
  let publish = '';
  let releaseLate;
  const stalled = withAuthRequestTimeout(
    () => new Promise((resolve) => { releaseLate = resolve; }), 'profile', 5,
  ).then(() => { publish = 'late response'; });
  await assert.rejects(stalled, AuthRequestTimeoutError);
  releaseLate('profile');
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(publish, '');

  const retry = await withAuthRequestTimeout(async () => 'verified profile', 'profile', 50);
  assert.equal(retry, 'verified profile');
});

test('loading state always resets when an auth operation fails or times out', async () => {
  const transitions = [];
  await assert.rejects(withLoadingState((loading) => transitions.push(loading), () =>
    withAuthRequestTimeout(() => new Promise(() => {}), 'session', 5)));
  assert.deepEqual(transitions, [true, false]);

  const retryTransitions = [];
  const result = await withLoadingState((loading) => retryTransitions.push(loading), async () => 'signed in');
  assert.equal(result, 'signed in');
  assert.deepEqual(retryTransitions, [true, false]);
});
