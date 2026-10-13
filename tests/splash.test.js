import { test } from 'node:test';
import assert from 'node:assert/strict';
import { motifFor, splashKeyFor, SPLASH_SHOW_MS, SPLASH_FADE_MS } from '../src/lib/splash.js';

test('motifFor() maps subject icons to expressive motifs', () => {
  assert.equal(motifFor('sigma'), 'math');
  assert.equal(motifFor('atom'), 'orbit');
  assert.equal(motifFor('book'), 'type');
  assert.equal(motifFor('cap'), 'brand');
  assert.equal(motifFor(undefined), 'brand');
});

test('splashKeyFor() groups routes by subject', () => {
  const math = { id: 'math-1' };
  const physics = { id: 'physics' };
  assert.equal(splashKeyFor({ name: 'home' }), 'home');
  assert.equal(splashKeyFor({ name: 'subject', subject: math }), 'subject:math-1');
  // lesson + revision inside the same subject share its key (no re-splash)
  assert.equal(splashKeyFor({ name: 'lesson', subject: math }), 'subject:math-1');
  assert.equal(splashKeyFor({ name: 'revision', subject: math }), 'subject:math-1');
  // switching subjects changes the key (splash plays)
  assert.notEqual(
    splashKeyFor({ name: 'subject', subject: math }),
    splashKeyFor({ name: 'subject', subject: physics }),
  );
});

test('splash timing is snappy (<1.2s total)', () => {
  assert.ok(SPLASH_SHOW_MS <= 900, `show ${SPLASH_SHOW_MS}ms should stay snappy`);
  assert.ok(SPLASH_SHOW_MS + SPLASH_FADE_MS <= 1200, 'total should stay under 1.2s');
});
