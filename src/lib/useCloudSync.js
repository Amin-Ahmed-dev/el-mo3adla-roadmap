import { useEffect, useRef, useState } from 'react';
import { getSupabaseAsync, isCloudConfigured } from '../lib/supabase.js';
import { cancelPendingPush, isApplyingCloud, markApplying, mergeCloudIntoLocal, pullCloud, schedulePush, toCloudData } from '../lib/cloud.js';
import { getProgressState, replaceProgressState, subscribeProgress, switchProfile } from '../store/progress.js';
import { useSession } from '../store/session.js';

/**
 * Offline-first cloud sync.
 *  - On sign-in: pull the student's row, merge into local (offline checkmarks
 *    win), push back the merged result.
 *  - On every local change while signed in: debounced push (~2.5s).
 * Returns { status, syncing } for the account UI.
 */
export function useCloudSync() {
  const { status, user } = useSession();
  const [syncing, setSyncing] = useState(false);
  const userId = user?.id || null;
  const pulledFor = useRef(null);
  // Count of operations that set syncing=true and have not settled yet.
  // Syncing shows only while > 0, so overlapping pull/push can never wedge it.
  const pendingRef = useRef(0);
  // True while a debounced push is scheduled/running. Rapid toggles share this
  // single slot, so the counter can't grow faster than end() drains it.
  const pushPendingRef = useRef(false);
  const begin = () => {
    if (pendingRef.current === 0) setSyncing(true);
    pendingRef.current += 1;
  };
  const end = () => {
    pendingRef.current = Math.max(0, pendingRef.current - 1);
    if (pendingRef.current === 0) setSyncing(false);
  };

  // Account-scoped local cache: each signed-in student gets their own
  // localStorage profile (store/progress.js), so a shared browser can never
  // leak or mix progress between accounts. Runs BEFORE the pull effect below
  // so the cloud merge lands on the right student's data; markApplying keeps
  // the push loop from treating the profile swap as a user edit.
  useEffect(() => {
    if (status === 'in' && userId) {
      markApplying(true);
      try { switchProfile(userId, { adoptCurrent: true }); } finally { markApplying(false); }
    } else if (status === 'out') {
      markApplying(true);
      try { switchProfile(null); } finally { markApplying(false); }
    }
    // 'unknown' → keep whatever the boot pointer restored
  }, [status, userId]);

  // Pull + merge on sign-in (once per user).
  useEffect(() => {
    if (status !== 'in' || !userId || !isCloudConfigured()) return undefined;
    if (pulledFor.current === userId) return undefined;
    pulledFor.current = userId;
    let cancelled = false;
    // Release the pending slot exactly once, on every exit path.
    let settled = false;
    const finish = () => { if (!settled) { settled = true; end(); } };
    begin();
    // Safety net: a hanging network call can never wedge "Syncing…" forever.
    const timeout = setTimeout(() => { if (!cancelled) finish(); }, 15000);
    (async () => {
      try {
        const { data } = await pullCloud(userId);
        if (cancelled) return;
        if (data) {
          markApplying(true); // don't echo the bulk swap as user edits
          try {
            const merged = mergeCloudIntoLocal(getProgressState(), data);
            replaceProgressState(merged);
          } finally {
            markApplying(false);
          }
        }
        // Push merged state up so the cloud row exists / is current.
        const sb = await getSupabaseAsync();
        if (cancelled) return;
        if (sb) {
          try {
            await sb.from('progress').upsert(
              { user_id: userId, data: toCloudData(getProgressState()), updated_at: new Date().toISOString() },
              { onConflict: 'user_id' }
            );
          } catch { /* offline — push happens on next change */ }
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) finish();
      }
    })();
    return () => { cancelled = true; clearTimeout(timeout); finish(); };
  }, [status, userId]);

  // Push on every local change (debounced inside schedulePush).
  useEffect(() => {
    if (status !== 'in' || !userId || !isCloudConfigured()) return undefined;
    const unsub = subscribeProgress(() => {
      if (isApplyingCloud()) return; // bulk swap from the pull, not a user edit
      // Take the pending slot only once per debounce cycle: rapid toggles in
      // the same burst just reschedule the push (schedulePush swaps onDone),
      // so begin() can never outrun end() and wedge "Syncing…" forever.
      if (!pushPendingRef.current) {
        pushPendingRef.current = true;
        begin();
      }
      schedulePush(userId, getProgressState, () => {
        pushPendingRef.current = false;
        end();
      });
    });
    // cancelPendingPush() flushes the pending onDone, releasing the slot.
    return () => { unsub(); cancelPendingPush(); };
  }, [status, userId]);

  // Sign-out: allow a fresh pull on next sign-in.
  useEffect(() => {
    if (status === 'out') {
      pulledFor.current = null;
      cancelPendingPush(); // flushes pending onDone → releases the slot
      pendingRef.current = 0;
      pushPendingRef.current = false;
      setSyncing(false);
    }
  }, [status ]);

  return { status, syncing, userId };
}
