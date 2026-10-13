import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cancelPendingPush, mergeCloudIntoLocal, schedulePush, toCloudData } from '../src/lib/cloud.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const local = {
  version: 1, lessons: { a: { steps: { learn: true }, done: false, conf: null } },
  rev: { r1: true }, extras: {}, notes: { a: 'mine' },
  streak: { count: 2 }, studyTime: { seconds: 10 }, last: 'a', exam: '',
};
const cloud = {
  version: 1, lessons: { b: { steps: { learn: true }, done: true, conf: 'okay' } },
  rev: { r2: true }, extras: { 'math-1:basics': true }, notes: { b: 'cloud' },
  streak: { count: 9 }, studyTime: { seconds: 99 }, last: 'b', exam: '2027-01-01',
};

describe('cloud merge', () => {
  it('unions lessons/rev/extras so offline checkmarks survive', () => {
    const m = mergeCloudIntoLocal(local, cloud);
    assert.ok(m.lessons.a.steps.learn, 'keeps local lesson');
    assert.ok(m.lessons.b.done, 'adopts cloud lesson');
    assert.equal(m.rev.r1, true);
    assert.equal(m.rev.r2, true);
    assert.equal(m.extras['math-1:basics'], true);
    assert.equal(m.notes.a, 'mine', 'local note wins ties');
    assert.equal(m.notes.b, 'cloud');
  });

  it('strips per-device fields before upload', () => {
    const up = toCloudData({ ...local, theme: 'dark', sound: false });
    assert.equal(up.theme, null);
    assert.equal(up.sound, true);
    assert.ok(up.lessons.a, 'keeps study data');
  });
});

describe('push scheduling (sync pending counter)', () => {
  it('a burst of reschedules fires onDone exactly once', async () => {
    let calls = 0;
    const done = () => { calls += 1; };
    // Rapid lesson toggles: each one re-arms the debounce timer.
    schedulePush('u1', () => ({}), done, 20);
    schedulePush('u1', () => ({}), done, 20);
    schedulePush('u1', () => ({}), done, 20);
    await sleep(80); // > 3x the 20ms delay
    assert.equal(calls, 1, 'one push cycle → one release, not zero and not three');
    cancelPendingPush(); // already fired — must not double-release
    assert.equal(calls, 1);
  });

  it('cancelPendingPush flushes the pending onDone so "Syncing…" cannot wedge', async () => {
    let calls = 0;
    schedulePush('u2', () => ({}), () => { calls += 1; }, 500);
    cancelPendingPush(); // sign-out / unmount while the push is still pending
    assert.equal(calls, 1, 'released immediately on cancel');
    await sleep(60);
    assert.equal(calls, 1, 'timer truly cancelled — no double release');
  });
});
