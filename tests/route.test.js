import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash } from '../src/lib/route.js';
import { ACTIVE, getLessons } from '../src/data/catalog.js';

const sub = ACTIVE[0];
const other = ACTIVE[1];
const lessons = getLessons(sub);

test('parseHash() routes the home page', () => {
  for (const h of ['', '#', '#/']) assert.equal(parseHash(h).name, 'home');
});

test('parseHash() routes a subject', () => {
  const r = parseHash(`#/${sub.id}`);
  assert.equal(r.name, 'subject');
  assert.equal(r.subject.id, sub.id);
});

test('parseHash() routes a lesson', () => {
  const r = parseHash(`#/${sub.id}/lesson/${lessons[0].id}`);
  assert.equal(r.name, 'lesson');
  assert.equal(r.subject.id, sub.id);
  assert.equal(r.lesson.id, lessons[0].id);
});

test('parseHash() routes revision pages, including the legacy link', () => {
  assert.equal(parseHash(`#/${sub.id}/revision`).name, 'revision');
  assert.equal(parseHash('#/revision').name, 'legacy-revision');
});

test('parseHash() reports unknown and malformed routes as notfound', () => {
  const cases = [
    '#/no-such-subject',
    `#/${sub.id}/lesson`,
    `#/${sub.id}/lesson/no-such-lesson`,
    `#/${other.id}/lesson/${lessons[0].id}`, // lesson opened under another subject
    `#/${sub.id}/revision/extra`,
    `#/${sub.id}/junk`,
  ];
  for (const h of cases) assert.equal(parseHash(h).name, 'notfound', h);
});
