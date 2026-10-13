/**
 * Lazy Supabase singleton with code-split SDK.
 * Reads Vite env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
 * Returns null when not configured — the app keeps working fully offline
 * on localStorage, and the Account modal shows a "cloud not configured" hint.
 * Only the anon public key is ever used client-side (never service_role).
 *
 * The SDK itself is dynamically imported so it lands in its own chunk and is
 * only downloaded when auth/cloud is actually used — the main bundle stays
 * lean for anonymous students.
 */
let client = null;
let warned = false;
let clientPromise = null;

export function supabaseUrl() {
  return (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || '';
}

export function isCloudConfigured() {
  return Boolean(
    import.meta.env &&
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

export function getSupabase() {
  if (client) return client;
  if (!isCloudConfigured()) {
    if (!warned && import.meta.env && import.meta.env.DEV) {
      warned = true;
      console.warn('[cloud] Supabase env vars missing — running offline (localStorage only).');
    }
    return null;
  }
  // Code-split: the SDK is only fetched the first time auth/cloud runs.
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      client = createClient(supabaseUrl(), import.meta.env.VITE_SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
      return client;
    }).catch((e) => {
      clientPromise = null;
      if (import.meta.env && import.meta.env.DEV) console.warn('[cloud] SDK load failed:', e?.message || e);
      return null;
    });
  }
  return null; // async path: call getSupabaseAsync() instead
}

/** Async client access for auth flows (awaits the code-split SDK chunk). */
export function getSupabaseAsync() {
  if (client) return Promise.resolve(client);
  getSupabase(); // kicks off the import, warns when unconfigured
  return clientPromise || Promise.resolve(null);
}
