/**
 * Cloudflare Pages Function — GET /api/check-email?email=you@example.com
 *
 * Pre-signup "is this a real mailbox?" check (zero cost, no third-party API):
 *   1. format check (same rules the UI enforces)
 *   2. disposable / throwaway domain blocklist
 *   3. MX lookup via Cloudflare DNS-over-HTTPS — the domain must be able to
 *      receive mail (falls back to an A record for domains that accept mail
 *      on the apex without an MX record).
 *
 * Design rule: NEVER block a signup because this checker failed — if
 * anything here throws or DNS is unavailable we answer { ok: true } and the
 * regular Supabase confirmation email stays the verification backstop.
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', 'tempmailo.com',
  '10minutemail.com', 'guerrillamail.com', 'guerrillamail.info',
  'yopmail.com', 'yopmail.fr', 'trashmail.com', 'trashmail.me',
  'sharklasers.com', 'getnada.com', 'dispostable.com', 'maildrop.cc',
  'fakeinbox.com', 'throwawaymail.com', 'moakt.com', 'linshiyouxiang.net',
  'mailnesia.com', 'tempr.email', 'cool.fr.nf', 'jetable.org',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function dnsAnswers(name, type) {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    { headers: { accept: 'application/dns-json' } },
  );
  if (!res.ok) throw new Error(`DoH ${res.status}`);
  const json = await res.json();
  return Array.isArray(json.Answer) ? json.Answer : [];
}

export async function onRequestGet({ request }) {
  const json = (obj) => new Response(JSON.stringify(obj), {
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
  });

  const url = new URL(request.url);
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();

  if (!EMAIL_RE.test(email)) return json({ ok: false, reason: 'invalid' });
  const domain = email.split('@')[1];
  if (DISPOSABLE_DOMAINS.has(domain)) return json({ ok: false, reason: 'disposable' });

  try {
    const mx = await dnsAnswers(domain, 'MX');
    if (mx.some((a) => a.type === 15)) return json({ ok: true });
    const a = await dnsAnswers(domain, 'A');
    if (a.some((ans) => ans.type === 1)) return json({ ok: true });
    return json({ ok: false, reason: 'no-mail' });
  } catch {
    return json({ ok: true }); // fail open — inbox confirmation is the backstop
  }
}
