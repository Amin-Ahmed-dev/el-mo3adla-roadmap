import { useSyncExternalStore } from 'react';
import { getSupabaseAsync } from '../lib/supabase.js';
import { authResult } from '../lib/authErrors.js';

/**
 * Minimal auth session store (React 19: useSyncExternalStore, same pattern as
 * store/progress.js). Holds { status, user } where status is one of:
 *   'unknown' (boot / cloud unconfigured) · 'in' · 'out'
 * Re-exports just enough auth actions for the Account modal.
 */

let session = { status: 'unknown', user: null };
let listeners = [];
let started = false;

const emit = () => listeners.forEach((fn) => fn());
const subscribe = (fn) => { listeners.push(fn); return () => { listeners = listeners.filter((x) => x !== fn); }; };
const getSnapshot = () => session;

function setSession(next) {
  session = next;
  emit();
}

function start() {
  if (started) return;
  started = true;
  getSupabaseAsync().then((sb) => {
    if (!sb) { setSession({ status: 'unknown', user: null }); return; }
    sb.auth.getSession().then(({ data }) => {
      setSession({ status: data.session ? 'in' : 'out', user: data.session?.user || null });
    }).catch(() => setSession({ status: 'out', user: null }));
    sb.auth.onAuthStateChange((_event, next) => {
      setSession({ status: next ? 'in' : 'out', user: next?.user || null });
    });
  }).catch(() => setSession({ status: 'unknown', user: null }));
}

export function useSession() {
  start();
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function sessionEmail() {
  return session.user?.email || '';
}

/** Wrap an auth SDK call so network drops / thrown errors can't wedge the UI. */
async function safeAuth(fn) {
  try {
    const { error } = await fn();
    return authResult(error);
  } catch (err) {
    return authResult(err);
  }
}

export async function signUp(email, password) {
  const sb = await getSupabaseAsync();
  if (!sb) return { error: 'Cloud sync is not configured yet.', rateLimited: false };
  try {
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) return authResult(error);
    // Confirm-email ON: Supabase creates the user but returns no session until
    // the inbox link is clicked. Tell the UI so it doesn't claim "signed in".
    if (data && !data.session) return { error: null, rateLimited: false, needsConfirm: true };
    return { error: null, rateLimited: false };
  } catch (err) {
    return authResult(err);
  }
}

export async function signIn(email, password) {
  const sb = await getSupabaseAsync();
  if (!sb) return { error: 'Cloud sync is not configured yet.', rateLimited: false };
  return safeAuth(() => sb.auth.signInWithPassword({ email, password }));
}

export async function signOut() {
  const sb = await getSupabaseAsync();
  if (!sb) return { error: 'Cloud sync is not configured yet.' };
  try {
    const { error } = await sb.auth.signOut();
    return authResult(error); // same friendly shaping as every other auth call
  } catch (err) {
    return authResult(err);
  }
}

export async function resetPassword(email) {
  const sb = await getSupabaseAsync();
  if (!sb) return { error: 'Cloud sync is not configured yet.', rateLimited: false };
  return safeAuth(() => sb.auth.resetPasswordForEmail(email, {
    // Land back on the app root (no stale route hash) — auth params are added
    // by Supabase's redirect, then consumed by lib/authLink.js on boot.
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
  }));
}

/** Set a new password for the signed-in user (used after a recovery link). */
export async function updatePassword(password) {
  const sb = await getSupabaseAsync();
  if (!sb) return { error: 'Cloud sync is not configured yet.', rateLimited: false };
  return safeAuth(() => sb.auth.updateUser({ password }));
}
