import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize } from '../src/store/progress.js';
import { ACTIVE, getLessons, getRevision } from '../src/data/catalog.js';
import {
  lessonState,
  stepsDone,
  status,
  subjectStats,
  subjectNextStep,
  revisionStats,
  overallStats,
  nextInSubject,
  lessonBlockedBy,
  continueTarget,
  weakLessons,
  hasStarted,
  examInfo,
  extraKey,
  extraDone,
  lessonHref,
} from '../src/lib/selectors.js';

const sub = ACTIVE[0];
const lessons = getLessons(sub);
const fresh = () => normalize({});
const doneState = (list) =>
  normalize({ lessons: Object.fromEntries(list.map((l) => [l.id, { steps: {}, done: true, conf: null }])) });

test('lessonState falls back to an untouched lesson', () => {
  assert.deepEqual(lessonState(fresh(), 'no-such-lesson'), { steps: {}, done: false, conf: null });
});

test('stepsDone and status read the lesson steps', () => {
  const todo = fresh();
  assert.equal(stepsDone(todo, lessons[0]), 0);
  assert.equal(status(todo, lessons[0]), 'todo');

  const prog = normalize({ lessons: { [lessons[0].id]: { steps: { learn: true } } } });
  assert.equal(stepsDone(prog, lessons[0]), 1);
  assert.equal(status(prog, lessons[0]), 'prog');

  const done = normalize({ lessons: { [lessons[0].id]: { steps: {}, done: true, conf: null } } });
  assert.equal(status(done, lessons[0]), 'done');
});

test('subjectStats counts done lessons', () => {
  assert.deepEqual(subjectStats(fresh(), sub), { done: 0, total: lessons.length, pct: 0 });
  assert.deepEqual(subjectStats(doneState(lessons), sub), {
    done: lessons.length,
    total: lessons.length,
    pct: 100,
  });
});

test('revisionStats counts revision items', () => {
  for (const s of ACTIVE) {
    assert.equal(revisionStats(fresh(), s).total, getRevision(s).length);
  }
  const withItems = ACTIVE.find((s) => getRevision(s).length > 0);
  if (withItems) {
    const first = getRevision(withItems)[0];
    assert.equal(revisionStats(normalize({ rev: { [first.id]: true } }), withItems).done, 1);
  }
});

test('overallStats matches the per-subject sums', () => {
  const s = normalize({ lessons: { [lessons[0].id]: { steps: {}, done: true, conf: null } } });
  let done = 0, total = 0, rDone = 0, rTotal = 0;
  for (const subject of ACTIVE) {
    done += subjectStats(s, subject).done;
    total += subjectStats(s, subject).total;
    rDone += revisionStats(s, subject).done;
    rTotal += revisionStats(s, subject).total;
  }
  assert.deepEqual(overallStats(s), {
    done,
    total,
    rDone,
    rTotal,
    pct: total ? Math.round((done / total) * 100) : 0,
  });
});

test('examInfo counts days until the exam', () => {
  assert.equal(examInfo(fresh()), null);
  assert.equal(examInfo(normalize({ exam: 'not-a-date' })), null);
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  assert.equal(examInfo(normalize({ exam: iso })).days, 3);
});

test('hasStarted, extras and lessonHref', () => {
  assert.equal(hasStarted(fresh()), false);
  assert.equal(hasStarted(normalize({ last: lessons[0].id })), true);
  assert.equal(extraKey(sub, 'basics'), `${sub.id}:basics`);
  assert.equal(extraDone(fresh(), sub, 'basics'), false);
  const withExtra = normalize({ extras: { [extraKey(sub, 'basics')]: true } });
  assert.equal(extraDone(withExtra, sub, 'basics'), true);
  assert.equal(lessonHref(lessons[0]), `#/${sub.id}/lesson/${lessons[0].id}`);
});

test('nextInSubject walks and wraps the lesson list', () => {
  assert.equal(nextInSubject(fresh(), sub, -1), lessons[0]);
  assert.equal(nextInSubject(doneState(lessons), sub, -1), null);
  // Wraps around: only the second lesson is done, so from the end we land on the first.
  const partial = normalize({ lessons: { [lessons[1].id]: { steps: {}, done: true, conf: null } } });
  assert.equal(nextInSubject(partial, sub, lessons.length - 1), lessons[0]);
});

test('continueTarget follows the last opened lesson', () => {
  assert.equal(continueTarget(fresh()), lessons[0]);
  // An unfinished last lesson is where the student continues.
  const back = normalize({ last: lessons[1].id, lessons: {} });
  assert.equal(continueTarget(back), lessons[1]);
  // A finished last lesson moves on to the next one in the same subject.
  const movedOn = normalize({
    last: lessons[1].id,
    lessons: { [lessons[1].id]: { steps: {}, done: true, conf: null } },
  });
  assert.equal(continueTarget(movedOn), lessons[2]);
});

test('weakLessons lists lessons marked weak', () => {
  const s = normalize({ lessons: { [lessons[0].id]: { steps: {}, done: false, conf: 'weak' } } });
  assert.deepEqual(weakLessons(s).map((l) => l.id), [lessons[0].id]);
  assert.deepEqual(weakLessons(fresh()), []);
});

test('subjectNextStep points at the basics first', () => {
  assert.deepEqual(subjectNextStep(fresh(), sub), { label: 'Start with the basics', tone: 'start' });
});

test('lessonBlockedBy locks a lesson until the one before it is done', () => {
  const [first, second] = lessons;
  // The first lesson of a subject is always unlocked; later lessons are locked while pending.
  assert.equal(lessonBlockedBy(fresh(), first), null);
  assert.equal(lessonBlockedBy(fresh(), second), first);
  // Completing the previous lesson unlocks the next one.
  assert.equal(lessonBlockedBy(doneState([first]), second), null);
});
