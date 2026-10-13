import { useSyncExternalStore } from 'react';
import { SITE } from '../config.js';
import { lessonById } from '../data/catalog.js';
import { fireConfetti } from '../lib/confetti.js';

/**
 * All student progress lives in one object in localStorage, scoped per account
 * so a shared browser can never leak or mix progress between students:
 *   - signed-in:      '<storageKey>:<userId>'   (the student's private cache)
 *   - anonymous:      '<storageKey>'            (the device's local vault)
 *   - '<storageKey>:profile' remembers which profile is active across reloads
 * Shape:
 *   { version: 1,
 *     lessons: { [lessonId]: { steps: {learn:true,...}, done, conf } },
 *     rev: { [itemId]: true },
 *     extras: { 'math-1:basics': true, 'math-1:guide': true },
 *     notes: { [lessonId]: 'My personal notes' },
 *     streak: { count: 1, lastDate: '2026-09-30' },
 *     sound: true,
 *     studyTime: { date: '2026-09-30', seconds: 1200 },
 *     last: lessonId | null, exam: 'YYYY-MM-DD' | '', theme: 'light' | 'dark' | null }
 */
const KEY = SITE.storageKey;
/** Pointer to the active profile (signed-in user id, or null = device vault). */
const PTR_KEY = `${KEY}:profile`;
/** Bump when the stored shape changes and add the change as a step in migrate(). */
export const SCHEMA_VERSION = 1;

/** localStorage key for a student's private cache (null → the device vault). */
export function profileKeyFor(userId) {
  return userId ? `${KEY}:${userId}` : KEY;
}
const EMPTY_LESSON = { steps: {}, done: false, conf: null };

/** Frequent actions update the in-memory state right away but batch their localStorage
 *  writes: [ how long to wait, longest a batch may stay open ]. */
const TIMER_FLUSH = { deferMs: 5000, maxWaitMs: 5000 }; // timer ticks -> one write per 5s
const NOTES_FLUSH = { deferMs: 1000, maxWaitMs: 3000 }; // typing     -> at most one write per 3s

function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const CONFIDENCE_VALUES = [null, 'weak', 'okay', 'strong'];
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Bring a stored (or imported) object up to the current schema.
 * Runs before normalize(), which whitelists the fields this build knows, so data
 * written by a newer build keeps only the parts this build understands.
 */
export function migrate(raw) {
  const o = isObj(raw) ? raw : {};
  const from = Number.isFinite(o.version) ? o.version : 0;
  if (from >= SCHEMA_VERSION) return o;
  // v0 -> v1: objects written before a version field existed. v0 has the same
  // fields, so there is nothing to rename; normalize() repairs the values.
  return { ...o, version: SCHEMA_VERSION };
}

/** Drop corrupt lesson entries (anything that would crash the selectors later). */
function sanitizeLessons(v) {
  if (!isObj(v)) return {};
  const out = {};
  for (const [id, l] of Object.entries(v)) {
    if (!id || !isObj(l)) continue;
    const steps = {};
    if (isObj(l.steps)) for (const [k, val] of Object.entries(l.steps)) steps[k] = !!val;
    out[id] = { steps, done: !!l.done, conf: CONFIDENCE_VALUES.includes(l.conf) ? l.conf : null };
  }
  return out;
}

/** Keep only known fields and put every one of them in its documented shape. */
export function normalize(o) {
  o = isObj(o) ? o : {};
  const num = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : 0);
  return {
    version: SCHEMA_VERSION,
    lessons: sanitizeLessons(o.lessons),
    rev: isObj(o.rev) ? Object.fromEntries(Object.entries(o.rev).map(([k, v]) => [k, !!v])) : {},
    extras: isObj(o.extras) ? Object.fromEntries(Object.entries(o.extras).map(([k, v]) => [k, !!v])) : {},
    notes: isObj(o.notes)
      ? Object.fromEntries(Object.entries(o.notes).filter(([, v]) => typeof v === 'string'))
      : {},
    streak: isObj(o.streak)
      ? { count: num(o.streak.count), lastDate: typeof o.streak.lastDate === 'string' ? o.streak.lastDate : '' }
      : { count: 0, lastDate: '' },
    sound: typeof o.sound === 'boolean' ? o.sound : true,
    studyTime: isObj(o.studyTime)
      ? {
          date: typeof o.studyTime.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.studyTime.date)
            ? o.studyTime.date
            : getLocalDateString(),
          seconds: num(o.studyTime.seconds),
        }
      : { date: getLocalDateString(), seconds: 0 },
    last: typeof o.last === 'string' ? o.last : null,
    exam: typeof o.exam === 'string' ? o.exam : '',
    theme: o.theme === 'dark' || o.theme === 'light' ? o.theme : null,
  };
}

function readFrom(key) {
  try { return normalize(migrate(JSON.parse(localStorage.getItem(key)))); } catch { return normalize(migrate(null)); }
}

// The active profile: `activeKey` is the localStorage key this store reads and
// writes. It starts from the boot pointer (last signed-in student, or the
// device vault) and changes via switchProfile() when the session settles.
let activeKey = profileKeyFor(readPointerUserId());
let state = readFrom(activeKey);
const listeners = new Set();

function readPointerUserId() {
  try { return localStorage.getItem(PTR_KEY) || null; } catch { return null; }
}

function savePointerUserId(userId) {
  try {
    if (userId) localStorage.setItem(PTR_KEY, userId);
    else localStorage.removeItem(PTR_KEY);
  } catch { /* private mode: in-memory only */ }
}

/** True when this profile has ever been stored on the device (vs never seen). */
function hasStored(key) {
  try { return localStorage.getItem(key) !== null; } catch { return false; }
}

/** Subscribe to every commit (used by the cloud sync loop). */
export function subscribeProgress(fn) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** Read-only access for the cloud sync loop (no subscription). */
export function getProgressState() { return state; }

/** Replace whole state (used when cloud data arrives). Skips chime replay. */
export function replaceProgressState(next, { persist = true } = {}) {
  state = normalize(next);
  if (persist) { if (persistTimer !== null) { clearTimeout(persistTimer); persistTimer = null; } writeState(); }
  listeners.forEach((fn) => fn());
}

/** Which profile the store is currently on (tests/debug). */
export function activeProfileKey() { return activeKey; }

function writeState() {
  try { localStorage.setItem(activeKey, JSON.stringify(state)); } catch { /* private mode: keep working in memory */ }
}

/**
 * Swap the whole store to another student's private cache — or back to the
 * device's anonymous vault on sign-out. Each signed-in student gets their own
 * localStorage profile, so one shared browser can never leak or mix progress
 * between accounts.
 *  - A pending batched write is flushed under the OLD profile first, so no
 *    keystrokes/progress from the current profile leak into the next one.
 *  - If the new profile was never stored on this device and `adoptCurrent` is
 *    set (first sign-in here), the current local progress is adopted as that
 *    account's seed AND the device vault is reset — the data now belongs to
 *    the account, not to the next person who opens this browser.
 * Idempotent: switching to the already-active profile is a no-op (StrictMode).
 */
export function switchProfile(userId, { adoptCurrent = false } = {}) {
  const nextKey = profileKeyFor(userId);
  if (nextKey === activeKey) return;
  flushPending(); // write the OLD profile's pending batch first (never leaks)
  activeKey = nextKey;
  savePointerUserId(userId);
  if (hasStored(nextKey)) {
    state = readFrom(nextKey);
  } else if (adoptCurrent && userId) {
    // First sign-in on this device: this local progress becomes the account's.
    state = normalize(migrate(state));
    try { localStorage.setItem(KEY, JSON.stringify(normalize(migrate(null)))); } catch { /* ignore */ }
  } else {
    state = normalize(migrate(null));
  }
  if (persistTimer !== null) { clearTimeout(persistTimer); persistTimer = null; }
  writeState(); // make the new profile durable immediately
  listeners.forEach((l) => l());
}

/* Batched writes: TIMER_FLUSH/NOTES_FLUSH actions change the in-memory state on
 * every tick/keystroke but only touch localStorage when their batch window closes. */
let persistTimer = null;
let persistWindowStart = 0;
function flushPending() {
  if (persistTimer === null) return;
  clearTimeout(persistTimer);
  persistTimer = null;
  writeState();
}
function schedulePersist(deferMs, maxWaitMs) {
  const now = Date.now();
  if (persistTimer === null) persistWindowStart = now;
  else clearTimeout(persistTimer);
  const wait = Math.max(0, Math.min(deferMs, maxWaitMs - (now - persistWindowStart)));
  persistTimer = setTimeout(() => { persistTimer = null; writeState(); }, wait);
}
function commit(next, batch) {
  state = next;
  if (batch && batch.deferMs > 0) {
    schedulePersist(batch.deferMs, batch.maxWaitMs || batch.deferMs);
  } else {
    if (persistTimer !== null) { clearTimeout(persistTimer); persistTimer = null; }
    writeState();
  }
  listeners.forEach((l) => l());
}
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
const getState = () => state;

// Keep several open tabs in step, and never lose a batched write when the tab goes away.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    // Only react to writes for the profile this tab has active.
    if (e.key === activeKey) { state = readFrom(activeKey); listeners.forEach((l) => l()); }
  });
  window.addEventListener('pagehide', flushPending);
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushPending();
    });
  }
}

export const useProgress = () => useSyncExternalStore(subscribe, getState, getState);

/* ---------------- audio feedback ---------------- */
export function playChime(kind = 'step') {
  if (!state.sound || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (kind === 'lesson') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    /* Silent on unsupported or restricted environments */
  }
}

function updateStreakInternal(curStreak) {
  const today = getLocalDateString();
  const streak = { ...curStreak };
  if (streak.lastDate === today) return streak;
  const yest = getYesterdayDateString();
  if (streak.lastDate === yest) {
    streak.count = (streak.count || 0) + 1;
  } else {
    streak.count = 1;
  }
  streak.lastDate = today;
  return streak;
}

/* ------------------------------ actions ------------------------------ */
function updateLesson(id, fn) {
  const cur = state.lessons[id] || EMPTY_LESSON;
  const next = fn({ ...cur, steps: { ...cur.steps } });
  const streak = updateStreakInternal(state.streak);
  commit({ ...state, streak, lessons: { ...state.lessons, [id]: next } });
}

/* ---------------- sign-in gate (study actions require an account) ----------------
 * App.jsx installs this while the student is signed out: study-progress
 * actions become no-ops and the student is nudged to sign in. Device
 * preferences (theme, sound) and pure browsing always keep working. Tests /
 * environments where the gate is never installed behave exactly as before. */
let gateOn = false;
let gateBlocked = null;
let gateNudgedAt = 0;
/** At most one sign-in nudge per this window — a burst of blocked calls (a
 *  running focus timer, note keystrokes) can never loop the modal. */
const GATE_NUDGE_COOLDOWN_MS = 4000;
export function setStudyGate({ enabled, onBlocked } = {}) {
  const wasOn = gateOn;
  gateOn = !!enabled;
  gateBlocked = onBlocked || null;
  if (!wasOn && gateOn) gateNudgedAt = 0; // first blocked action after sign-out nudges right away
}
/** True when this study action must be ignored (signed-out student). */
function gated(notify = true) {
  if (!gateOn) return false;
  if (notify) {
    const now = Date.now();
    if (now - gateNudgedAt >= GATE_NUDGE_COOLDOWN_MS) {
      gateNudgedAt = now;
      try { gateBlocked && gateBlocked(); } catch { /* UI hook */ }
    }
  }
  return true;
}

export const toggleStep = (id, key) => {
  if (gated()) return;
  const subject = lessonById[id] && lessonById[id].subject;
  const keys = subject ? subject.steps.map((s) => s.k) : [];
  const cur = state.lessons[id] || EMPTY_LESSON;
  const was = !!cur.steps[key];
  const willBeDone = !was;

  if (willBeDone && keys.length > 0) {
    const allDone = keys.every((k) => k === key || !!cur.steps[k]);
    if (allDone) {
      completeLesson(id);
      return;
    }
  }

  updateLesson(id, (l) => {
    l.steps[key] = willBeDone;
    if (!was) playChime('step');
    if (was && l.done) l.done = false;
    return l;
  });
};

export const completeLesson = (id) => {
  if (gated()) return;
  const subject = lessonById[id] && lessonById[id].subject;
  const keys = subject ? subject.steps.map((s) => s.k) : [];
  playChime('lesson');
  fireConfetti();
  updateLesson(id, (l) => {
    keys.forEach((k) => { l.steps[k] = true; });
    l.done = true;
    return l;
  });
};

export const reopenLesson = (id) => { if (gated()) return; updateLesson(id, (l) => {
  l.done = false;
  l.steps = {};
  l.conf = null;
  return l;
}); };
export const setConfidence = (id, v) => { if (gated()) return; updateLesson(id, (l) => { l.conf = l.conf === v ? null : v; return l; }); };

export const setLessonNote = (id, text) => {
  if (gated()) return;
  const notes = { ...state.notes };
  if (!text || text.trim() === '') {
    delete notes[id];
  } else {
    notes[id] = text;
  }
  commit({ ...state, notes }, NOTES_FLUSH);
};

export const addStudySeconds = (secs) => {
  // Passive accrual (focus timer ticks): silently dropped while signed out —
  // the timer itself keeps running, it just doesn't save minutes yet.
  if (gated(false)) return;
  const today = getLocalDateString();
  let st = state.studyTime || { date: today, seconds: 0 };
  if (st.date !== today) st = { date: today, seconds: 0 };
  const streak = updateStreakInternal(state.streak);
  commit({
    ...state,
    streak,
    studyTime: { date: today, seconds: st.seconds + secs },
  }, TIMER_FLUSH);
};

export const toggleSound = () => commit({ ...state, sound: !state.sound });
export const toggleExtra = (key) => { if (gated()) return; commit({ ...state, extras: { ...state.extras, [key]: !state.extras[key] } }); };
export const toggleRevision = (id) => {
  if (gated()) return;
  const streak = updateStreakInternal(state.streak);
  playChime('step');
  commit({ ...state, streak, rev: { ...state.rev, [id]: !state.rev[id] } });
};
export const setLast = (id) => { if (gated(false) || state.last === id) return; commit({ ...state, last: id }); };
export const setExam = (value) => { if (gated()) return; commit({ ...state, exam: value || '' }); };
export const setTheme = (theme) => commit({ ...state, theme });

/* ------------- backup encode/decode (internal — not exposed in the UI) -------------
   The "Backup code / reset" UI was removed in favor of Supabase auth + cloud
   sync; exportCode/importCode remain as a safe snapshot format used by the
   test suite. Students move progress by signing in, not by copying codes. */
export function exportCode() {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}

/**
 * Stricter than normalize(): a backup code must match the shape this app writes
 * or it is rejected, so unrelated JSON can never replace a student's progress.
 */
function validBackup(o) {
  if (!isObj(o)) return false;
  if (!isObj(o.lessons)) return false;
  for (const l of Object.values(o.lessons)) {
    if (!isObj(l)) return false;
    if (l.steps !== undefined && !isObj(l.steps)) return false;
    if (l.done !== undefined && typeof l.done !== 'boolean') return false;
    if (l.conf !== undefined && !CONFIDENCE_VALUES.includes(l.conf)) return false;
  }
  for (const key of ['rev', 'extras', 'notes', 'streak', 'studyTime']) {
    if (o[key] !== undefined && !isObj(o[key])) return false;
  }
  if (isObj(o.notes)) for (const v of Object.values(o.notes)) if (typeof v !== 'string') return false;
  if (o.sound !== undefined && typeof o.sound !== 'boolean') return false;
  if (o.last !== undefined && o.last !== null && typeof o.last !== 'string') return false;
  if (o.exam !== undefined && typeof o.exam !== 'string') return false;
  if (o.theme !== undefined && o.theme !== null && o.theme !== 'light' && o.theme !== 'dark') return false;
  if (o.version !== undefined && !Number.isFinite(o.version)) return false;
  return true;
}

export function importCode(code) {
  try {
    const raw = typeof code === 'string' ? code.trim() : '';
    if (!raw || raw.length > 5_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) return false;
    const bin = atob(raw);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const o = JSON.parse(new TextDecoder().decode(bytes));
    if (!validBackup(o)) return false;
    commit(normalize(migrate({
      ...o,
      theme: state.theme, // each device keeps its own theme
      sound: typeof o.sound === 'boolean' ? o.sound : state.sound,
    })));
    return true;
  } catch { return false; }
}
