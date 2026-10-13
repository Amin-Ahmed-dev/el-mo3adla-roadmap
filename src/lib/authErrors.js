/**
 * Pure auth-error helpers (no React, no Supabase import) so node:test can
 * cover every message / rate-limit branch directly.
 * session.js imports these; AccountModal only sees the shaped result.
 */
import { PASSWORD_MIN_LENGTH } from './password.js';

/** Detect Supabase/GoTrue rate limiting (HTTP 429, code or message). */
export function isRateLimit(err) {
  if (!err) return false;
  if (typeof err !== 'object') return /rate.?limit|too many|429/.test(String(err));
  const status = err.status ?? err.code;
  if (status === 429 || status === '429') return true;
  const msg = String(err.message || '');
  const code = String(err.code || err.error_code || err.error || '');
  return (
    /rate.?limit|too many|over_request|slow down|exceeded.*request|request.*exceed/i.test(msg) ||
    /rate.?limit|over_request|too_many/i.test(code)
  );
}

/** Turn Supabase / network errors into short student-friendly messages. */
export function friendlyError(err) {
  // Extract only a real message string — never String({}) → "[object Object]".
  const raw = typeof err === 'string' ? err : err?.message;
  const msg = String(raw || '').trim();
  if (!msg) return 'Something went wrong. Try again.';
  if (/invalid login credentials|invalid email or password/i.test(msg)) return 'Wrong email or password. Try again.';
  if (/user already registered|already been registered|in use|user.*exists/i.test(msg)) return 'This email already has an account. Sign in instead.';
  if (/password.*(short|length|characters)|at least \d+ characters/i.test(msg)) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (/different from the old|should be different/i.test(msg)) return 'Choose a password different from your current one.';
  if (/email not confirmed|email.*confirm/i.test(msg)) return 'Please confirm your email first, then sign in.';
  if (/rate.?limit|too many|over_request|slow down|status code 429/i.test(msg)) return 'Too many attempts — wait a minute, then try again.';
  if (/session.*not found|not authenticated|refresh_token|no session|session expired|invalid session/i.test(msg)) return 'Your reset session expired. Open the link from your inbox again.';
  if (/failed to fetch|network request failed|fetch failed|load failed|offline|timed out|timeout|connection|err_internet|err_network/i.test(msg)) return 'Network error. Check your connection and try again.';
  if (/invalid.*email/i.test(msg)) return 'Enter a valid email address.';
  // Never dump a raw server blob into the UI.
  if (msg.length > 160) return 'Something went wrong. Try again.';
  return msg;
}

/** Shape every auth action's result: { error, rateLimited }. */
export function authResult(error) {
  if (!error) return { error: null, rateLimited: false };
  return { error: friendlyError(error), rateLimited: isRateLimit(error) };
}
