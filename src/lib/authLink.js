/**
 * Supabase email-link helpers (password recovery + email confirmations).
 *
 * Supabase verifies the link on its side, then redirects back to our Site URL
 * with auth params appended to the hash, e.g.
 *   #access_token=...&refresh_token=...&type=recovery
 *   #error=access_denied&error_description=Email+link+is+invalid+or+has+expired
 *
 * This app hash-routes on '#/subject/lesson/...', so those params must be:
 *   1. read exactly once at boot, BEFORE the Supabase client is created
 *      (its detectSessionInUrl consumes them to build the session), and
 *   2. stripped from the address bar so parseHash() sees a normal route.
 * Everything here is DOM-light so node:test can import it directly.
 */

/** Parse an auth-callback hash. Returns null for normal app routes. */
export function parseAuthHash(hash) {
  const raw = String(hash || '').replace(/^#/, '');
  if (!raw) return null;
  let params;
  try { params = new URLSearchParams(raw); } catch { return null; }
  const type = params.get('type');
  const error = params.get('error');
  const errorDescription = params.get('error_description') || '';
  const hasToken = params.has('access_token') || params.has('refresh_token');
  const hasCode = params.has('code');
  if (!type && !error && !errorDescription && !hasToken && !hasCode) return null;
  return { type, error, errorDescription, hasToken, hasCode };
}

/** Map Supabase's raw link errors to a student-friendly sentence ('' = unknown). */
export function friendlyLinkError(desc = '') {
  const s = String(desc || '');
  if (/expired/i.test(s)) return 'This link has expired. Request a new one from the sign-in form.';
  if (/invalid|not found|malformed/i.test(s)) return 'This link is invalid. Request a new one from the sign-in form.';
  return '';
}

/** Auth params present in the hash when this module first loaded (pre-client). */
export const initialAuthLink =
  typeof window !== 'undefined' ? parseAuthHash(window.location.hash) : null;

let consumed = false;
/** One-shot read of the boot link — returns null on every call after the first. */
export function consumeAuthLink() {
  if (consumed) return null;
  consumed = true;
  return initialAuthLink;
}

/**
 * Strip auth params from the address bar without adding a history entry.
 * replaceState doesn't fire hashchange, so we dispatch one for the router.
 */
export function clearAuthHash() {
  if (typeof window === 'undefined' || !window.history || !window.history.replaceState) return false;
  if (!parseAuthHash(window.location.hash)) return false;
  window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/');
  window.dispatchEvent(new Event('hashchange'));
  return true;
}
