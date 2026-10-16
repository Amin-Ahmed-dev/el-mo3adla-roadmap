import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMAIL_RE,
  checkEmailDeliverable,
  emailDomain,
  emailVerdictMessage,
  quickEmailCheck,
} from '../src/lib/emailCheck.js';

test('EMAIL_RE matches the form validation rules', () => {
  assert.ok(EMAIL_RE.test('student@gmail.com'));
  assert.ok(!EMAIL_RE.test('not-an-email'));
  assert.ok(!EMAIL_RE.test('a@b'));
  assert.ok(!EMAIL_RE.test('a b@c.com'));
});

test('emailDomain lowercases and trims', () => {
  assert.equal(emailDomain('  Student@GMail.COM '), 'gmail.com');
  assert.equal(emailDomain('no-at-sign'), '');
});

test('quickEmailCheck rejects bad format', () => {
  assert.deepEqual(quickEmailCheck('nope'), { ok: false, reason: 'invalid' });
});

test('quickEmailCheck rejects throwaway domains', () => {
  const v = quickEmailCheck('someone@mailinator.com');
  assert.deepEqual(v, { ok: false, reason: 'disposable' });
});

test('quickEmailCheck passes a normal address', () => {
  assert.deepEqual(quickEmailCheck('student@gmail.com'), { ok: true });
});

test('emailVerdictMessage maps reasons to messages', () => {
  assert.equal(emailVerdictMessage({ ok: true }), null);
  assert.equal(emailVerdictMessage(null), null);
  assert.match(emailVerdictMessage({ ok: false, reason: 'disposable' }), /real email/i);
  assert.match(emailVerdictMessage({ ok: false, reason: 'no-mail' }), /undeliverable/i);
  assert.match(emailVerdictMessage({ ok: false, reason: 'invalid' }), /undeliverable/i);
});

test('checkEmailDeliverable rejects without network (sync part first)', async () => {
  assert.deepEqual(await checkEmailDeliverable('bad-format'), { ok: false, reason: 'invalid' });
  assert.deepEqual(await checkEmailDeliverable('x@yopmail.com'), { ok: false, reason: 'disposable' });
});

test('checkEmailDeliverable never rejects — fails open on network errors', async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.reject(new Error('offline'));
  try {
    assert.deepEqual(await checkEmailDeliverable('student@gmail.com', 50), { ok: true });
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('checkEmailDeliverable accepts a domain with MX records (mocked)', async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ Answer: [{ type: 15, data: '10 mx.example.com.' }] }),
  });
  try {
    assert.deepEqual(await checkEmailDeliverable('a@example.com', 1000), { ok: true });
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('checkEmailDeliverable rejects a domain with no MX and no A (mocked)', async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({}) });
  try {
    assert.deepEqual(await checkEmailDeliverable('a@dead.invalid', 1000), {
      ok: false,
      reason: 'no-mail',
    });
  } finally {
    globalThis.fetch = origFetch;
  }
});
