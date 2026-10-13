import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSubjects } from '../src/data/validate.js';

const STEPS = ['learn', 'notes', 'solve', 'practice'].map((k) => ({ k, n: k }));

/** A minimal subject that passes every rule. */
const subject = (over = {}) => ({
  id: 'test-1',
  title: 'Test Subject',
  color: 'blue',
  status: 'active',
  steps: STEPS,
  groups: [
    {
      id: 'g1',
      title: 'Group 1',
      color: 'blue',
      units: [
        {
          id: 'u1',
          title: 'Unit 1',
          book: { title: 'Book', url: './pdfs/test/unit.pdf' },
          lessons: [
            {
              id: 't-l1',
              title: 'Lesson 1',
              label: 'Lesson 1',
              res: {
                learn: [{ t: 'Video', u: 'https://example.com/video', k: 'video', req: 'yes' }],
                notes: [{ t: 'Notes book', u: './pdfs/test/l1.pdf', k: 'pdf', req: 'yes' }],
                solve: [{ t: 'Solving', u: 'https://example.com/solve', k: 'video', req: 'rec' }],
                practice: [{ t: 'Practice book', u: './pdfs/test/l1-practice.pdf', k: 'pdf', req: 'opt' }],
              },
            },
          ],
        },
      ],
    },
  ],
  revision: [
    { id: 'rev-g', title: 'Revision', items: [{ id: 'rev-1', title: 'Item 1', url: 'https://example.com/revision' }] },
  ],
  basics: null,
  guide: null,
  ...over,
});

/** fileExists() that reports any path containing "missing" as absent. */
const exists = (url) => !url.includes('missing');

test('a complete subject passes with no errors', () => {
  const { errors, warnings, summary } = validateSubjects([subject()]);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  assert.equal(summary.length, 1);
  assert.equal(summary[0].status, 'active');
  assert.equal(summary[0].lessons, 1);
  assert.equal(summary[0].linked, 6); // book + 4 resources + revision item
});

test('local files are reported when fileExists says they are absent', () => {
  const brokenBook = subject();
  brokenBook.groups[0].units[0].book.url = './pdfs/test/typo-missing.pdf';
  const r = validateSubjects([brokenBook], { fileExists: exists });
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /missing local file: \.\/pdfs\/test\/typo-missing\.pdf/);

  const brokenRes = subject();
  brokenRes.groups[0].units[0].lessons[0].res.notes[0].u = './pdfs/test/gone-missing.pdf';
  const r2 = validateSubjects([brokenRes], { fileExists: exists });
  assert.equal(r2.errors.length, 1);
  assert.match(r2.errors[0], /missing local file: \.\/pdfs\/test\/gone-missing\.pdf/);

  const withBasics = subject({
    basics: { title: 'Basics', resources: [{ t: 'Intro', u: './pdfs/test/basics-missing.pdf', k: 'pdf', req: 'yes' }] },
  });
  const r3 = validateSubjects([withBasics], { fileExists: exists });
  assert.equal(r3.errors.length, 1);
  assert.match(r3.errors[0], /basics/);
});

test('a passing fileExists leaves no errors', () => {
  assert.deepEqual(validateSubjects([subject()], { fileExists: () => true }).errors, []);
});

test('without fileExists the local paths are not checked (browser)', () => {
  const broken = subject();
  broken.groups[0].units[0].book.url = './pdfs/test/nope.pdf';
  assert.deepEqual(validateSubjects([broken]).errors, []);
  assert.deepEqual(validateSubjects([broken], {}).errors, []);
});

test('bad links and shapes still produce the existing errors', () => {
  const bad = subject({ id: 'Bad Id', color: 'red', title: '' });
  const r = validateSubjects([bad]);
  assert.equal(r.errors.some((e) => e.includes('lowercase letters')), true);
  assert.equal(r.errors.some((e) => e.includes('unknown colour')), true);
  assert.equal(r.errors.some((e) => e.includes('missing title')), true);

  const badLink = subject();
  badLink.groups[0].units[0].lessons[0].res.learn[0].u = 'youtu.be/x';
  const r2 = validateSubjects([badLink], { fileExists: () => true });
  assert.equal(r2.errors.some((e) => e.includes('must be a web link')), true);
});

test('duplicate lesson ids are rejected', () => {
  const a = subject();
  const b = subject({ id: 'test-2', title: 'Other' });
  const r = validateSubjects([a, b]);
  assert.equal(r.errors.some((e) => e.includes('also used in')), true);
});

test('a coming-soon subject is skipped and summarized', () => {
  const r = validateSubjects([subject({ status: 'soon', groups: [] })]);
  assert.deepEqual(r.errors, []);
  assert.equal(r.summary[0].status, 'soon');
});

test('an empty list validates cleanly', () => {
  const r = validateSubjects([]);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
  assert.deepEqual(r.summary, []);
});
