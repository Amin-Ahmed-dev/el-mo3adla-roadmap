/**
 * Client-side pre-signup email check (no server needed).
 *
 * Replaces the old `/api/check-email` server fetch: that Cloudflare Pages
 * Function never runs on Workers/Netlify/local builds, where the route falls
 * back to the SPA's index.html and the check silently failed open for every
 * address. Doing the same three checks in the browser works on every host:
 *   1. format check (same EMAIL_RE rules the form enforces)
 *   2. disposable / throwaway domain blocklist
 *   3. MX lookup via DNS-over-HTTPS — the domain must be able to receive
 *      mail (falls back to an A record for domains that accept mail on the
 *      apex without an MX record).
 *
 * Design rule: NEVER block a signup because this checker failed — if the
 * network, DoH endpoint, or JSON parse fails we return { ok: true } and the
 * Supabase confirmation email stays the verification backstop.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', 'tempmailo.com',
  '10minutemail.com', 'guerrillamail.com', 'guerrillamail.info',
  'yopmail.com', 'yopmail.fr', 'trashmail.com', 'trashmail.me',
  'sharklasers.com', 'getnada.com', 'dispostable.com', 'maildrop.cc',
  'fakeinbox.com', 'throwawaymail.com', 'moakt.com', 'linshiyouxiang.net',
  'mailnesia.com', 'tempr.email', 'cool.fr.nf', 'jetable.org',
]);

export function emailDomain(email) {
  return String(email || '').trim().toLowerCase().split('@')[1] || '';
}

/** Synchronous part only: format + disposable-domain. Pure, instant. */
export function quickEmailCheck(email) {
  const em = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(em)) return { ok: false, reason: 'invalid' };
  if (DISPOSABLE_DOMAINS.has(emailDomain(em))) return { ok: false, reason: 'disposable' };
  return { ok: true };
}

/** Map a { ok, reason } verdict to the student-facing message (null = proceed). */
export function emailVerdictMessage(verdict) {
  if (!verdict || verdict.ok) return null;
  if (verdict.reason === 'disposable') {
    return 'Please use your real email address — temporary inboxes are not allowed.';
  }
  return 'This email address looks undeliverable. Double-check it and try again.';
}

async function dnsAnswers(name, type, signal) {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    { headers: { accept: 'application/dns-json' }, signal },
  );
  if (!res.ok) throw new Error(`DoH ${res.status}`);
  const json = await res.json();
  return Array.isArray(json.Answer) ? json.Answer : [];
}

/**
 * Full async check: quick checks first, then the MX/A lookup with a timeout.
 * Always resolves — never rejects — and fails open ({ ok: true }) on any
 * internal failure so a DNS hiccup can never lock a real student out.
 */
export async function checkEmailDeliverable(email, timeoutMs = 6000) {
  const quick = quickEmailCheck(email);
  if (!quick.ok) return quick;
  const domain = emailDomain(email);
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const mx = await dnsAnswers(domain, 'MX', ctrl ? ctrl.signal : undefined);
    if (mx.some((a) => a && a.type === 15)) return { ok: true };
    const a = await dnsAnswers(domain, 'A', ctrl ? ctrl.signal : undefined);
    if (a.some((ans) => ans && ans.type === 1)) return { ok: true };
    return { ok: false, reason: 'no-mail' };
  } catch {
    return { ok: true }; // fail open — inbox confirmation is the backstop
  } finally {
    if (timer) clearTimeout(timer);
  }
}
