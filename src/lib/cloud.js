import { migrate, normalize } from '../store/progress.js';

/**
 * Cloud bridge for the `progress` table (user_id uuid PK, data jsonb).
 * Offline-first: localStorage is always the source of truth for rendering;
 * this module only pushes local state up and pulls cloud state down.
 *
 * Merge rule (newest-wins per field group, no silent overwrites):
 *  - lessons / rev / extras / notes merge key-by-key, preferring the side
 *    whose `completedAt`-ish signal is newer — in practice we compare the
 *    row's updated_at against the last push stamp kept in memory, and union
 *    truthy lesson steps so a checkmark made offline is never lost.
 *  - streak / studyTime / last / exam keep whichever side updated most
 *    recently; theme/sound always stay local (per-device).
 */

let lastPushedAt = 0;
let pushTimer = null;
let pushOnDone = null; // pending onDone of the scheduled push; flushed (never dropped) on cancel
let quietUntil = 0; // suppress subscriber notifications for bulk swaps (cloud pull)

/** True while inside a bulk swap whose subscriber notices should be skipped. */
export function isApplyingCloud() { return Date.now() < quietUntil; }

/** Temporarily suppress subscriber notifications (cloud pull → replace). */
export function markApplying(on) {
  quietUntil = on ? Date.now() + 1000 : 0;
}

/** Lazy supabase access: keeps node:test of pure merge logic dependency-free. */
async function supabaseForIO() {
  const { getSupabaseAsync } = await import('./supabase.js');
  return getSupabaseAsync();
}

function truthyUnion(a = {}, b = {}) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b || {})) {
    if (v) out[k] = v;
    else if (!(k in out)) out[k] = v;
  }
  return out;
}

/** Merge cloud `data` into local state without dropping offline checkmarks. */
export function mergeCloudIntoLocal(local, cloudRaw) {
  const cloud = normalize(migrate(cloudRaw));
  const mergedLessons = { ...(local.lessons || {}) };
  for (const [id, cl] of Object.entries(cloud.lessons || {})) {
    const ll = mergedLessons[id];
    if (!ll) { mergedLessons[id] = cl; continue; }
    const steps = { ...(ll.steps || {}) };
    for (const [k, v] of Object.entries(cl.steps || {})) if (v) steps[k] = true;
    mergedLessons[id] = {
      steps,
      done: ll.done || cl.done,
      conf: ll.conf || cl.conf || null,
    };
  }
  const localCount = Object.keys(local.lessons || {}).length;
  const cloudCount = Object.keys(cloud.lessons || {}).length;
  // Scalar fields: keep the side that has more completed lessons (proxy for
  // "most recently studied"); ties keep local so nothing flickers.
  const takeCloudScalars = cloudCount > localCount;
  return {
    ...local,
    lessons: mergedLessons,
    rev: truthyUnion(local.rev, cloud.rev),
    extras: truthyUnion(local.extras, cloud.extras),
    notes: { ...(cloud.notes || {}), ...(local.notes || {}) },
    streak: takeCloudScalars ? cloud.streak : local.streak,
    studyTime: takeCloudScalars ? cloud.studyTime : local.studyTime,
    last: takeCloudScalars ? (cloud.last || local.last) : local.last,
    exam: cloud.exam || local.exam || '',
  };
}

/** Strip per-device fields before uploading (theme/sound stay local). */
export function toCloudData(state) {
  const { theme: _t, sound: _s, ...rest } = state || {};
  return { ...rest, theme: null, sound: true };
}

/** Pull the student's row; returns { data, updatedAt } or nulls. */
export async function pullCloud(userId) {
  const sb = await supabaseForIO();
  if (!sb || !userId) return { data: null, updatedAt: null };
  try {
    const { data, error } = await sb
      .from('progress')
      .select('data, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return { data: data?.data || null, updatedAt: data?.updated_at || null };
  } catch (e) {
    if (import.meta.env?.DEV) console.warn('[cloud] pull failed:', e?.message || e);
    return { data: null, updatedAt: null };
  }
}

/** Push local state up (debounced by the caller via schedulePush). onDone always
 *  runs — success, failure or missing client — so the UI can never wedge on
 *  "Syncing…" forever. */
async function pushNow(userId, state, onDone) {
  const done = () => { try { onDone && onDone(); } catch { /* UI callback */ } };
  const sb = await supabaseForIO();
  if (!sb || !userId) { done(); return; }
  try {
    const { error } = await sb.from('progress').upsert(
      { user_id: userId, data: toCloudData(state), updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) throw error;
    lastPushedAt = Date.now();
  } catch (e) {
    if (import.meta.env?.DEV) console.warn('[cloud] push failed (will retry on next change):', e?.message || e);
  } finally {
    done();
  }
}

/** Push immediately (no debounce). Resolves when the request settles (success
 *  or failure). Used before sign-out so nothing unsynced is stranded. */
export function pushNowAsync(userId, getState) {
  return new Promise((resolve) => {
    pushNow(userId, getState(), resolve);
  });
}

/** Debounced push: batches rapid toggles into one upsert ~2.5s after last
 *  change. Rescheduling replaces the pending onDone — only the latest runs,
 *  exactly once — so a burst of changes can never leak a pending slot. */
export function schedulePush(userId, getState, onDone, delayMs = 2500) {
  if (!userId) { onDone && onDone(); return; }
  clearTimeout(pushTimer);
  pushOnDone = onDone;
  pushTimer = setTimeout(() => {
    pushTimer = null;
    const cb = pushOnDone;
    pushOnDone = null;
    pushNow(userId, getState(), cb);
  }, delayMs);
}

/** Cancel a pending debounced push (sign-out / unmount). The pending onDone
 *  is still flushed exactly once so the caller's pending counter (and the
 *  "Syncing…" UI) can never wedge. */
export function cancelPendingPush() {
  clearTimeout(pushTimer);
  pushTimer = null;
  if (pushOnDone) {
    const cb = pushOnDone;
    pushOnDone = null;
    try { cb(); } catch { /* UI callback */ }
  }
}

export function lastPushStamp() {
  return lastPushedAt;
}
