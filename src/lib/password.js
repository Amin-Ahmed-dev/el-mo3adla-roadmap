/**
 * Pure strong-password policy (no React, no Supabase) so node:test can cover
 * every rule directly. Enforced client-side on BOTH the sign-up form and the
 * set-new-password (recovery link) form, so a reset can't be used to sneak a
 * weak password past the policy. The Supabase minimum-length setting is the
 * server-side backstop for length; character-class rules live here.
 *
 * Design intent: make online guessing / credential-stuffing impractical by
 * demanding a wide character set. Length is the single strongest lever, so the
 * floor is 8 (settable higher in one place below).
 */
export const PASSWORD_MIN_LENGTH = 8;

/** Ordered rules; each exposes a stable key, a student-facing label, a test,
 *  and a hint shown while that rule is still unsatisfied. */
export const PASSWORD_RULES = [
  { key: 'len', label: `At least ${PASSWORD_MIN_LENGTH} characters`, hint: `${PASSWORD_MIN_LENGTH}+ characters`,
    test: (v) => v.length >= PASSWORD_MIN_LENGTH },
  { key: 'lower', label: 'A lowercase letter', hint: 'a lowercase letter',
    test: (v) => /[a-z]/.test(v) },
  { key: 'upper', label: 'An uppercase letter', hint: 'an uppercase letter',
    test: (v) => /[A-Z]/.test(v) },
  { key: 'digit', label: 'A number', hint: 'a number',
    test: (v) => /[0-9]/.test(v) },
  // A real symbol — whitespace does NOT count (so "Password 1" is rejected).
  { key: 'symbol', label: 'A symbol (like ! @ # $)', hint: 'a symbol',
    test: (v) => /[^A-Za-z0-9\s]/.test(v) },
];

/** Validate a candidate password.
 *  Returns { ok, checks } where checks is one { key, label, hint, ok } per rule,
 *  so the UI can render a live checklist and the caller can gate submit on `ok`. */
export function validatePassword(value) {
  const v = String(value ?? '');
  const checks = PASSWORD_RULES.map((r) => ({ key: r.key, label: r.label, hint: r.hint, ok: r.test(v) }));
  return { ok: checks.every((c) => c.ok), checks };
}

/** A short, student-friendly line naming the first failing rule ('' when ok).
 *  Used as the inline form error if a submit slips through without the checklist. */
export function firstPasswordIssue(value) {
  const { checks } = validatePassword(value);
  const first = checks.find((c) => !c.ok);
  if (!first) return '';
  if (first.key === 'len') return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  return `Password must include ${first.hint}.`;
}
