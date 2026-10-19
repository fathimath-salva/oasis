import assert from 'node:assert/strict';
import test from 'node:test';
import { accessNoticeForDecision, authorizeView, getRoleLandingView, matchesLoginAudience } from '../src/lib/accessControl.ts';
import { publicRegistrationMetadata } from '../src/lib/registration.ts';
import { parseAppLocation } from '../src/lib/appRoutes.ts';

const session = (role, overrides = {}) => ({
  isLoading: false,
  isAuthenticated: true,
  isRoleVerified: true,
  role,
  ...overrides,
});

test('public registration metadata cannot supply a role', () => {
  const metadata = publicRegistrationMetadata(' Customer ', ' 555 ');
  assert.deepEqual(metadata, { full_name: 'Customer', phone: '555' });
  assert.equal(Object.hasOwn(metadata, 'role'), false);
});

test('customers are denied both staff and admin routes and land on customer pages', () => {
  assert.equal(authorizeView('staff-dashboard', session('customer')).status, 'denied');
  assert.equal(authorizeView('admin-dashboard', session('customer')).status, 'denied');
  assert.equal(authorizeView('my-account', session('customer')).status, 'allowed');
  assert.equal(getRoleLandingView('customer'), 'my-appointments');
});

test('direct protected URLs resolve to guarded routes and do not grant roles', () => {
  const directAdmin = parseAppLocation('/admin');
  const directStaff = parseAppLocation('/staff');
  assert.equal(authorizeView(directAdmin.view, session('customer')).status, 'denied');
  assert.equal(authorizeView(directStaff.view, session('customer')).status, 'denied');
  assert.equal(authorizeView(directAdmin.view, session('staff')).status, 'denied');
  assert.equal(authorizeView(directStaff.view, session('admin')).status, 'denied');
});

test('staff can enter only the staff dashboard', () => {
  assert.equal(authorizeView('staff-dashboard', session('staff')).status, 'allowed');
  assert.equal(authorizeView('admin-dashboard', session('staff')).status, 'denied');
  assert.equal(getRoleLandingView('staff'), 'staff-dashboard');
});

test('admins can enter only the admin dashboard', () => {
  assert.equal(authorizeView('admin-dashboard', session('admin')).status, 'allowed');
  assert.equal(authorizeView('staff-dashboard', session('admin')).status, 'denied');
  assert.equal(getRoleLandingView('admin'), 'admin-dashboard');
});

test('team login entry points require the exact profile role', () => {
  assert.equal(matchesLoginAudience('admin', 'admin'), true);
  assert.equal(matchesLoginAudience('staff', 'staff'), true);
  assert.equal(matchesLoginAudience('admin', 'customer'), false);
  assert.equal(matchesLoginAudience('staff', 'admin'), false);
});

test('unverified profiles cannot open protected routes while loading waits', () => {
  assert.equal(authorizeView('admin-dashboard', session('admin', { isRoleVerified: false })).status, 'denied');
  assert.equal(authorizeView('admin-dashboard', session('admin', { isRoleVerified: false })).reason, 'profile_unverified');
  assert.equal(authorizeView('staff-dashboard', session('staff', { isLoading: true })).status, 'loading');
});

test('public pages never require a signed-in or verified profile', () => {
  const publicPages = ['home', 'services', 'about', 'contact', 'terms'];
  for (const page of publicPages) {
    assert.deepEqual(authorizeView(page, {
      isLoading: false, isAuthenticated: false, isRoleVerified: false, role: null,
    }), { status: 'allowed' }, `${page} must remain public when signed out`);
    assert.deepEqual(authorizeView(page, {
      isLoading: false, isAuthenticated: true, isRoleVerified: false, role: null,
    }), { status: 'allowed' }, `${page} must remain public when profile verification fails`);
  }
});

test('the profile-verification failure that formerly persisted on Home is distinguished from role mismatch', () => {
  const missingOrUnreadableProfile = authorizeView('my-appointments', session('customer', { isRoleVerified: false }));
  assert.equal(missingOrUnreadableProfile.status, 'denied');
  if (missingOrUnreadableProfile.status === 'denied') {
    assert.equal(missingOrUnreadableProfile.reason, 'profile_unverified');
    assert.match(missingOrUnreadableProfile.message, /profile could not be verified/i);
  }
  const wrongRole = authorizeView('staff-dashboard', session('customer'));
  assert.equal(wrongRole.status, 'denied');
  if (wrongRole.status === 'denied') assert.equal(wrongRole.reason, 'role_mismatch');
});

test('a real denied navigation creates feedback, while returning to a public page clears the stale notice', () => {
  const denied = authorizeView('admin-dashboard', session('customer'));
  assert.equal(accessNoticeForDecision(denied), 'Your verified account does not have permission to open that page.');

  const homeReturn = authorizeView('home', session('customer'));
  assert.equal(homeReturn.status, 'allowed');
  assert.equal(accessNoticeForDecision(homeReturn), null);

  for (const page of ['services', 'about', 'contact']) {
    assert.equal(accessNoticeForDecision(authorizeView(page, session('customer'))), null);
  }
});

test('demo dashboards stay separate from real role checks', () => {
  assert.equal(authorizeView('demo-admin', session('customer')).status, 'allowed');
  assert.equal(authorizeView('demo-staff', session(null, { isAuthenticated: false })).status, 'allowed');
});
