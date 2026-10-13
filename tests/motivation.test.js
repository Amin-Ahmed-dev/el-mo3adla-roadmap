import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOTIVATION_POOL,
  MOTIVATIONAL_PHRASES,
  MOTIVATION_LEN,
  dayIndexFor,
  motivationForDate,
  motivationIndexFor,
  msUntilMidnight,
  todayKey,
} from '../src/data/motivation.js';

test('pool holds title+body objects with no empties', () => {
  assert.ok(MOTIVATION_POOL.length >= 40, `expected a full rotation, got ${MOTIVATION_POOL.length}`);
  for (const [i, p] of MOTIVATION_POOL.entries()) {
    assert.equal(typeof p.t, 'string', `pool[${i}].t`);
    assert.equal(typeof p.b, 'string', `pool[${i}].b`);
    assert.ok(p.t.trim().length > 3, `pool[${i}].t non-empty`);
    assert.ok(p.b.trim().length > 3, `pool[${i}].b non-empty`);
  }
});

test('legacy string export stays in sync with the pool', () => {
  assert.equal(MOTIVATIONAL_PHRASES.length, MOTIVATION_LEN);
  assert.equal(MOTIVATIONAL_PHRASES.length, MOTIVATION_POOL.length);
});

test('same calendar day always maps to the same phrase', () => {
  const a = new Date(2026, 9, 13, 8, 30);
  const b = new Date(2026, 9, 13, 22, 45);
  assert.equal(motivationIndexFor(a), motivationIndexFor(b));
  assert.deepEqual(motivationForDate(a), motivationForDate(b));
});

test('consecutive days advance deterministically (no randomness)', () => {
  const i0 = motivationIndexFor(new Date(2026, 9, 13));
  const i1 = motivationIndexFor(new Date(2026, 9, 14));
  assert.equal(i1, (i0 + 1) % MOTIVATION_LEN);
});

test('midnight rollover arithmetic: month boundary + timer window', () => {
  assert.equal(
    motivationIndexFor(new Date(2026, 10, 1)),
    (motivationIndexFor(new Date(2026, 9, 31)) + 1) % MOTIVATION_LEN,
  );
  const ms = msUntilMidnight(new Date(2026, 9, 13, 23, 59, 30));
  assert.ok(ms > 0 && ms <= 31 * 1000, `expected ~30s, got ${ms}`);
  assert.ok(msUntilMidnight(new Date(2026, 9, 13, 12, 0)) > 0);
  assert.equal(dayIndexFor(new Date(2026, 9, 13, 23, 59)), dayIndexFor(new Date(2026, 9, 13, 0, 1)));
});

test('todayKey is a stable local-calendar key', () => {
  assert.equal(todayKey(new Date(2026, 0, 5)), '2026-1-5');
});

test('your top-5 recommended phrases are present verbatim', () => {
  const titles = MOTIVATION_POOL.map((p) => p.t);
  for (const top of ['فاضل تكة! 💪🏻', 'تعبك مش هيروح هدر 🤍', 'قربت توصل 🎯', 'متستسلمش دلوقتي 🔥', 'النهاية تليق بتعبك ✨']) {
    assert.ok(titles.includes(top), `missing top phrase: ${top}`);
  }
});
