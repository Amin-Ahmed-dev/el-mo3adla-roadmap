import test from 'node:test';
import assert from 'node:assert/strict';
import { authResult, friendlyError, isRateLimit } from '../src/lib/authErrors.js';
import { PASSWORD_MIN_LENGTH } from '../src/lib/password.js';

test('isRateLimit detects status, codes and messages', () => {
  assert.equal(isRateLimit({ status: 429, message: 'Too many requests' }), true);
  assert.equal(isRateLimit({ status: '429', message: 'x' }), true);
  assert.equal(isRateLimit({ code: 'over_request_rate_limit', message: 'You are sending too many requests' }), true);
  assert.equal(isRateLimit({ message: 'Rate limit exceeded' }), true);
  assert.equal(isRateLimit({ message: 'Email rate limit exceeded' }), true);
  assert.equal(isRateLimit({ message: 'Invalid login credentials' }), false);
  assert.equal(isRateLimit(null), false);
  assert.equal(isRateLimit(undefined), false);
});

test('friendlyError maps wrong-password and duplicate-account', () => {
  assert.equal(friendlyError({ message: 'Invalid login credentials' }), 'Wrong email or password. Try again.');
  assert.equal(friendlyError({ message: 'User already registered' }), 'This email already has an account. Sign in instead.');
});

test('friendlyError maps short password, confirmation and reset-expiry', () => {
  assert.equal(friendlyError({ message: 'Password should be at least 6 characters' }), `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  assert.equal(friendlyError({ message: 'Email not confirmed' }), 'Please confirm your email first, then sign in.');
  assert.equal(friendlyError({ message: 'Session not found' }), 'Your reset session expired. Open the link from your inbox again.');
});

test('friendlyError maps rate-limit and network failures', () => {
  assert.match(friendlyError({ status: 429, message: 'Too many requests' }), /Too many attempts/);
  assert.match(friendlyError(new TypeError('Failed to fetch')), /Network error/);
  assert.match(friendlyError({ message: 'Network request failed' }), /Network error/);
});

test('friendlyError never leaks raw dumps', () => {
  assert.equal(friendlyError(null), 'Something went wrong. Try again.');
  assert.equal(friendlyError({}), 'Something went wrong. Try again.');
  assert.equal(friendlyError({ message: 'x'.repeat(300) }), 'Something went wrong. Try again.');
});

test('authResult shapes success and failure', () => {
  assert.deepEqual(authResult(null), { error: null, rateLimited: false });
  const r = authResult({ status: 429, message: 'Rate limit exceeded' });
  assert.equal(r.rateLimited, true);
  assert.match(r.error, /Too many attempts/);
});
