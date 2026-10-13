import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { activeProfileKey, getProgressState, profileKeyFor, setExam, switchProfile } from '../src/store/progress.js';

describe('account-scoped local profiles', () => {
  it('profileKeyFor scopes per user; null is the anonymous device vault', () => {
    assert.equal(profileKeyFor(null), 'cs-equivalency-roadmap-v1');
    assert.equal(profileKeyFor('user-a'), 'cs-equivalency-roadmap-v1:user-a');
  });

  it('first sign-in adopts local progress; sign-out leaves a clean device vault; another student inherits nothing', () => {
    setExam('2027-02-02'); // simulate a local study session on this device
    switchProfile('user-a', { adoptCurrent: true });
    assert.equal(getProgressState().exam, '2027-02-02', 'local progress is adopted into the account');

    switchProfile(null); // sign out → back on the device vault
    assert.equal(getProgressState().exam, '', 'device vault no longer shows the account data');

    switchProfile('user-b', { adoptCurrent: true }); // a DIFFERENT student signs in
    assert.equal(getProgressState().exam, '', 'user-b must never inherit user-a progress');
    switchProfile(null);
  });

  it('switching to the already-active profile is a no-op (StrictMode-safe)', () => {
    switchProfile('user-c', { adoptCurrent: true });
    setExam('2027-03-03');
    switchProfile('user-c', { adoptCurrent: true }); // double-mount replay
    assert.equal(getProgressState().exam, '2027-03-03', 'state survives a repeated switch');
    assert.equal(activeProfileKey(), profileKeyFor('user-c'));
    switchProfile(null);
  });
});