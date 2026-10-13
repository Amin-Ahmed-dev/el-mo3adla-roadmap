import test from 'node:test';
import assert from 'node:assert/strict';
import { clearAuthHash, friendlyLinkError, parseAuthHash } from '../src/lib/authLink.js';

test('parseAuthHash ignores normal app routes', () => {
  assert.equal(parseAuthHash(''), null);
  assert.equal(parseAuthHash('#'), null);
  assert.equal(parseAuthHash('#/'), null);
  assert.equal(parseAuthHash('#/math-1'), null);
  assert.equal(parseAuthHash('#/physics/lesson/ph-1'), null);
  assert.equal(parseAuthHash('#/english/revision'), null);
});

test('parseAuthHash detects a password-recovery link', () => {
  const p = parseAuthHash('#access_token=abc123&refresh_token=xyz&type=recovery&expires_in=3600');
  assert.ok(p);
  assert.equal(p.type, 'recovery');
  assert.equal(p.hasToken, true);
  assert.equal(p.error, null);
});

test('parseAuthHash detects an email-confirmation link', () => {
  const p = parseAuthHash('#access_token=abc&type=signup');
  assert.ok(p);
  assert.equal(p.type, 'signup');
});

test('parseAuthHash detects an expired/invalid link error', () => {
  const p = parseAuthHash('#error=access_denied&error_description=Email+link+is+invalid+or+has+expired');
  assert.ok(p);
  assert.equal(p.error, 'access_denied');
  assert.match(p.errorDescription, /expired/i);
});

test('friendlyLinkError translates Supabase link errors', () => {
  assert.match(friendlyLinkError('Email link is invalid or has expired'), /expired/i);
  assert.match(friendlyLinkError('token is not found'), /invalid/i);
  assert.equal(friendlyLinkError(''), '');
});

test('clearAuthHash is a safe no-op without a window', () => {
  assert.equal(clearAuthHash(), false);
});
