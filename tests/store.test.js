import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_VERSION,
  migrate,
  normalize,
  exportCode,
  importCode,
  completeLesson,
  addStudySeconds,
  setLessonNote,
} from '../src/store/progress.js';
import { ACTIVE, getLessons } from '../src/data/catalog.js';

/** Same encoding exportCode() uses, so tests can build codes by hand. */
const encode = (value) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
};
const decode = (code) =>
  JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(code), (c) => c.charCodeAt(0))));
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* ------------------------------ normalize / migrate ------------------------------ */

test('normalize() builds the default shape from garbage', () => {
  for (const bad of [null, undefined, 'text', 42, [1, 2], { lessons: 'x' }]) {
    const s = normalize(bad);
    assert.deepEqual(s.lessons, {});
    assert.deepEqual(s.rev, {});
    assert.deepEqual(s.extras, {});
    assert.deepEqual(s.notes, {});
    assert.deepEqual(s.streak, { count: 0, lastDate: '' });
    assert.equal(s.sound, true);
    assert.equal(s.last, null);
    assert.equal(s.exam, '');
    assert.equal(s.theme, null);
    assert.equal(s.version, SCHEMA_VERSION);
    assert.equal(s.studyTime.seconds, 0);
    assert.match(s.studyTime.date, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test('normalize() keeps valid fields', () => {
  const s = normalize({
    lessons: { a: { steps: { learn: true }, done: true, conf: 'weak' } },
    rev: { r1: true },
    extras: { 'math-1:basics': true },
    notes: { a: 'my note' },
    streak: { count: 3, lastDate: '2026-10-05' },
    sound: false,
    studyTime: { date: '2026-10-05', seconds: 90 },
    last: 'a',
    exam: '2026-11-01',
    theme: 'dark',
  });
  assert.equal(s.lessons.a.done, true);
  assert.equal(s.lessons.a.steps.learn, true);
  assert.equal(s.lessons.a.conf, 'weak');
  assert.equal(s.rev.r1, true);
  assert.equal(s.extras['math-1:basics'], true);
  assert.equal(s.notes.a, 'my note');
  assert.deepEqual(s.streak, { count: 3, lastDate: '2026-10-05' });
  assert.equal(s.sound, false);
  assert.deepEqual(s.studyTime, { date: '2026-10-05', seconds: 90 });
  assert.equal(s.last, 'a');
  assert.equal(s.exam, '2026-11-01');
  assert.equal(s.theme, 'dark');
});

test('normalize() repairs corrupt values and drops unknown fields', () => {
  const s = normalize({
    lessons: {
      good: { steps: { learn: 'yes' }, done: 1, conf: 'weird' },
      bad: 5,
      alsoBad: [],
    },
    rev: { r1: 1 },
    notes: { ok: 'text', bad: 42 },
    streak: { count: 'many', lastDate: 7 },
    studyTime: { date: 'yesterday', seconds: 'lots' },
    sound: 'loud',
    last: 5,
    theme: 'blue',
    futureField: 'dropped',
  });
  assert.deepEqual(Object.keys(s.lessons), ['good']);
  assert.equal(s.lessons.good.steps.learn, true);
  assert.equal(s.lessons.good.done, true);
  assert.equal(s.lessons.good.conf, null);
  assert.equal(s.rev.r1, true);
  assert.deepEqual(s.notes, { ok: 'text' });
  assert.deepEqual(s.streak, { count: 0, lastDate: '' });
  assert.equal(s.studyTime.seconds, 0);
  assert.match(s.studyTime.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(s.sound, true);
  assert.equal(s.last, null);
  assert.equal(s.theme, null);
  assert.equal('futureField' in s, false);
  assert.equal(s.version, SCHEMA_VERSION);
});

test('migrate() stamps unversioned objects and passes current ones through', () => {
  assert.equal(migrate({ lessons: {} }).version, SCHEMA_VERSION);
  assert.equal(migrate(null).version, SCHEMA_VERSION);
  const current = { version: SCHEMA_VERSION, lessons: {} };
  assert.equal(migrate(current), current);
  const newer = { version: SCHEMA_VERSION + 1, lessons: {}, extra: true };
  assert.equal(migrate(newer), newer);
});

test('normalize() always stamps the current version', () => {
  assert.equal(normalize({}).version, SCHEMA_VERSION);
  assert.equal(normalize({ version: 99 }).version, SCHEMA_VERSION);
});

/* ------------------------------- backup codes ------------------------------- */

test('exportCode() and importCode() round-trip progress', () => {
  const payload = {
    lessons: { 'l-1': { steps: { learn: true, practice: true }, done: false, conf: 'okay' } },
    rev: { 'r-1': true },
    extras: { 'math-1:guide': true },
    notes: { 'l-1': 'ملاحظة مهمّة' },
    streak: { count: 4, lastDate: today() },
    sound: false,
    studyTime: { date: today(), seconds: 120 },
    last: 'l-1',
    exam: '2026-12-01',
  };
  assert.equal(importCode(encode(payload)), true);
  const back = decode(exportCode());
  assert.deepEqual(back.lessons, { 'l-1': { steps: { learn: true, practice: true }, done: false, conf: 'okay' } });
  assert.deepEqual(back.rev, { 'r-1': true });
  assert.equal(back.notes['l-1'], 'ملاحظة مهمّة');
  assert.equal(back.sound, false);
  assert.equal(back.last, 'l-1');
  assert.equal(back.exam, '2026-12-01');
  assert.equal(back.version, SCHEMA_VERSION);
});

test('importCode() rejects anything that is not a well-formed backup', () => {
  const before = exportCode();
  const badCodes = [
    '',
    '   ',
    'not base64!!',
    btoa('{"lessons":'), // valid base64, broken JSON
    encode(123),
    encode('hello'),
    encode([1, 2, 3]),
    encode({}),
    encode({ lessons: [] }),
    encode({ lessons: 'x' }),
    encode({ lessons: { a: 5 } }),
    encode({ lessons: { a: [] } }),
    encode({ lessons: { a: { steps: 'x' } } }),
    encode({ lessons: { a: { done: 'yes' } } }),
    encode({ lessons: { a: { conf: 'meh' } } }),
    encode({ lessons: {}, rev: 'nope' }),
    encode({ lessons: {}, notes: 42 }),
    encode({ lessons: {}, notes: { a: 7 } }),
    encode({ lessons: {}, sound: 'loud' }),
    encode({ lessons: {}, last: 7 }),
    encode({ lessons: {}, exam: 7 }),
    encode({ lessons: {}, theme: 'blue' }),
    encode({ lessons: {}, version: 'x' }),
  ];
  for (const code of badCodes) {
    assert.equal(importCode(code), false, `should reject: ${JSON.stringify(code).slice(0, 60)}`);
  }
  assert.equal(exportCode(), before, 'state must be untouched after rejections');
});

/* ------------------------------ study time & notes ------------------------------ */

test('addStudySeconds() accumulates within the same day', () => {
  importCode(encode({ lessons: {}, studyTime: { date: today(), seconds: 100 } }));
  addStudySeconds(5);
  const s = decode(exportCode());
  assert.equal(s.studyTime.seconds, 105);
  assert.equal(s.studyTime.date, today());
});

test('addStudySeconds() starts a new day at zero', () => {
  importCode(encode({
    lessons: {},
    studyTime: { date: '2000-01-01', seconds: 500 },
    streak: { count: 9, lastDate: '2000-01-01' },
  }));
  addStudySeconds(30);
  const s = decode(exportCode());
  assert.equal(s.studyTime.date, today());
  assert.equal(s.studyTime.seconds, 30);
});

test('setLessonNote() writes and clears notes', () => {
  importCode(encode({ lessons: {}, notes: { x: 'old' } }));
  setLessonNote('x', '   '); // whitespace clears the note
  setLessonNote('y', 'new note');
  const s = decode(exportCode());
  assert.equal('x' in s.notes, false);
  assert.equal(s.notes.y, 'new note');
  // An immediate save also flushes any write batched by the calls above,
  // so no deferred localStorage write is left pending for this test process.
  assert.equal(importCode(encode({ lessons: {} })), true);
});

/* --------------------------- sequential-study gate --------------------------- */

test('completeLesson refuses a lesson before the one before it is done', () => {
  importCode(encode({ lessons: {} }));
  const [first, second] = getLessons(ACTIVE[0]);
  // The second lesson stays locked while the first one is pending.
  completeLesson(second.id);
  let s = decode(exportCode());
  assert.ok(!s.lessons[second.id] || !s.lessons[second.id].done, 'locked lesson must not be completed');
  // Finishing the first lesson unlocks the second.
  completeLesson(first.id);
  completeLesson(second.id);
  s = decode(exportCode());
  assert.equal(s.lessons[first.id].done, true);
  assert.equal(s.lessons[second.id].done, true);
  // Flush any batched write the completions scheduled (see the note above).
  assert.equal(importCode(encode({ lessons: {} })), true);
});

