import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  addStudySeconds, getProgressState, setExam, setLast, setStudyGate,
  setTheme, toggleRevision,
} from '../src/store/progress.js';

/** Fresh gate cycle so the nudge cooldown clock resets for this test. */
function enableGate(onBlocked) {
  setStudyGate({ enabled: false });
  setStudyGate({ enabled: true, onBlocked });
}

describe('sign-in gate for study actions', () => {
  it('allows everything while the gate is not installed (default)', () => {
    setExam('2027-01-01');
    setLast('lesson-x');
    assert.equal(getProgressState().exam, '2027-01-01');
    assert.equal(getProgressState().last, 'lesson-x');
  });

  it('blocks study actions while enabled', () => {
    enableGate(() => {});
    const before = getProgressState();
    setExam('2027-06-06');
    toggleRevision('r-1');
    assert.equal(getProgressState().exam, before.exam, 'exam date unchanged');
    assert.equal(getProgressState().rev['r-1'], undefined, 'no revision toggle');
  });

  it('throttles nudges: a burst of blocked calls fires the callback once (no modal loop)', () => {
    let blocked = 0;
    enableGate(() => { blocked += 1; });
    const realNow = Date.now;
    try {
      let t = realNow();
      Date.now = () => t;
      setExam('2027-05-05');
      setExam('2027-05-06');
      toggleRevision('r-2');
      toggleRevision('r-3');
      assert.equal(blocked, 1, 'burst nudges exactly once');
      t += 5000; // past the 4s cooldown
      setExam('2027-05-07');
      assert.equal(blocked, 2, 'a later attempt nudges again');
    } finally {
      Date.now = realNow;
    }
  });

  it('focus-timer accrual (addStudySeconds) is silent while signed out', () => {
    let blocked = 0;
    enableGate(() => { blocked += 1; });
    const before = getProgressState().studyTime.seconds;
    addStudySeconds(1);
    addStudySeconds(1);
    addStudySeconds(1);
    assert.equal(getProgressState().studyTime.seconds, before, 'minutes not saved');
    assert.equal(blocked, 0, 'a running timer never spawns the sign-in form');
  });

  it('device preferences (theme) stay free while the gate is on', () => {
    enableGate(() => {});
    setTheme('dark');
    assert.equal(getProgressState().theme, 'dark', 'theme still toggles when signed out');
  });

  it('setLast is gated silently — opening a lesson never spawns the nudge', () => {
    let blocked = 0;
    enableGate(() => { blocked += 1; });
    const before = getProgressState().last;
    setLast('some-lesson');
    assert.equal(getProgressState().last, before, 'last-visit not recorded');
    assert.equal(blocked, 0, 'no toast/modal for merely opening a lesson');
  });

  it('restores normal behavior after sign-in (gate disabled)', () => {
    setStudyGate({ enabled: false });
    setExam('2027-12-31');
    toggleRevision('r-1');
    addStudySeconds(30);
    assert.equal(getProgressState().exam, '2027-12-31', 'study actions work again');
    assert.equal(getProgressState().rev['r-1'], true, 'revision toggles again');
    assert.ok(getProgressState().studyTime.seconds >= 30, 'focus minutes save again');
  });
});