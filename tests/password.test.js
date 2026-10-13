import test from 'node:test';
import assert from 'node:assert/strict';
import { PASSWORD_MIN_LENGTH, PASSWORD_RULES, firstPasswordIssue, validatePassword } from '../src/lib/password.js';

test('a strong password passes every rule', () => {
  const r = validatePassword('Mo3adla#2027');
  assert.equal(r.ok, true);
  assert.equal(r.checks.every((c) => c.ok), true);
});

test('common weak passwords are rejected', () => {
  for (const weak of ['12345678', 'password', 'ahmed2026', 'Passw0rd', 'qwerty!', 'iloveyou']) {
    assert.equal(validatePassword(weak).ok, false, `should reject: ${weak}`);
  }
});

test('short passwords fail the length rule', () => {
  const r = validatePassword('Aa1!x'); // 5 chars, has all classes
  assert.equal(r.ok, false);
  assert.equal(r.checks.find((c) => c.key === 'len').ok, false);
});

test('missing character classes are reported individually', () => {
  assert.equal(validatePassword('abcdefgh12!').checks.find((c) => c.key === 'upper').ok, false); // no uppercase
  assert.equal(validatePassword('ABCDEFGH12!').checks.find((c) => c.key === 'lower').ok, false); // no lowercase
  assert.equal(validatePassword('Abcdefgh!').checks.find((c) => c.key === 'digit').ok, false);   // no digit
  // A space is NOT a symbol.
  assert.equal(validatePassword('Abcdefgh 1').checks.find((c) => c.key === 'symbol').ok, false);
});

test('empty and non-string input never throw and never pass', () => {
  assert.equal(validatePassword('').ok, false);
  assert.equal(validatePassword(null).ok, false);
  assert.equal(validatePassword(undefined).ok, false);
  assert.equal(validatePassword(12345678).ok, false);
});

test('the rule list exposes 5 stable keys and honours the configured minimum', () => {
  assert.deepEqual(PASSWORD_RULES.map((r) => r.key), ['len', 'lower', 'upper', 'digit', 'symbol']);
  assert.ok(PASSWORD_MIN_LENGTH >= 8);
  // Exactly PASSWORD_MIN_LENGTH chars satisfies the length rule.
  assert.equal(validatePassword('Aa1!'.padEnd(PASSWORD_MIN_LENGTH, 'x')).checks.find((c) => c.key === 'len').ok, true);
});

test('firstPasswordIssue names a fixable problem, empty when valid', () => {
  assert.equal(firstPasswordIssue('Mo3adla#2027'), '');
  assert.match(firstPasswordIssue('short'), /at least 8 characters/);
  assert.match(firstPasswordIssue('alllowercase!1'), /uppercase/);
  assert.match(firstPasswordIssue('ALLUPPERCASE!1'), /lowercase/);
  assert.match(firstPasswordIssue('NoDigits!!'), /number/);
  assert.match(firstPasswordIssue('NoSymbol123'), /symbol/);
});
