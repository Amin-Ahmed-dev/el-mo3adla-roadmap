/**
 * Pure helpers for the branded route splash.
 * Kept free of JSX so node:test can import them directly.
 */

/** How long the splash stays fully visible before it starts fading (ms). */
export const SPLASH_SHOW_MS = 650;
/** How long the fade-out takes before the splash unmounts (ms). */
export const SPLASH_FADE_MS = 230;

/**
 * Map a subject icon name to a motion motif.
 *  sigma -> floating math glyphs · atom -> orbiting electrons
 *  book  -> typing lines          · anything else -> soft brand pulse
 */
export function motifFor(icon) {
  if (icon === 'sigma') return 'math';
  if (icon === 'atom') return 'orbit';
  if (icon === 'book') return 'type';
  return 'brand';
}

/**
 * Identity the splash is keyed on. Subject, lesson and revision routes that
 * belong to the same subject share one key, so the splash only plays when the
 * *subject* changes (lesson-to-lesson inside one subject stays instant).
 */
export function splashKeyFor(route) {
  if (!route) return 'home';
  if (route.name === 'home') return 'home';
  if (route.name === 'notfound') return 'notfound';
  if (route.name === 'legacy-revision') return 'legacy-revision';
  if (route.subject && route.subject.id) return `subject:${route.subject.id}`;
  return String(route.name || 'home');
}

/** True when the OS asks for reduced motion — the splash is skipped entirely. */
export function shouldSkipSplash() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
