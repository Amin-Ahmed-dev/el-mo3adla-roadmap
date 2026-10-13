/**
 * Building blocks for subject files.
 *
 * A resource is { t: title, u: link, k: 'video' | 'pdf', req: 'yes' | 'rec' | 'opt' }.
 * Leave the link empty ('') and the site shows "Link coming soon".
 */

// Every lesson follows the same path. A subject can override this with its own `steps`.
export const DEFAULT_STEPS = [
  { k: 'learn',    n: 'Learn',      sub: 'Watch the explanation',             ic: 'play',   cta: 'Start learning' },
  { k: 'notes',    n: 'Understand', sub: 'Read the notes',                    ic: 'file',   cta: 'Continue to the notes' },
  { k: 'solve',    n: 'Solve',      sub: 'Watch exam questions being solved', ic: 'play',   cta: 'Continue to solving' },
  { k: 'practice', n: 'Practice',   sub: 'Try the questions yourself',        ic: 'pencil', cta: 'Continue to practice' },
];

export const video = (t, u = '', req = 'yes') => ({ t, u, k: 'video', req });
export const pdf   = (t, u = '', req = 'yes') => ({ t, u, k: 'pdf',   req });

/** One placeholder resource per step. Use it for lessons you have not filled in yet. */
export const standard = () => ({
  learn:    [video('Explanation')],
  notes:    [pdf('Explanation book')],
  solve:    [video('Solving')],
  practice: [pdf('Practice book')],
});

/** lesson(id, label, title, resources) */
export const lesson = (id, label, title, res = standard()) => ({ id, label, title, res });

/**
 * Optional page sections of a subject (both show on its Roadmap tab):
 *   basics: { title, desc, resources: [video(...), pdf(...)] }   first, before the curriculum
 *   guide:  { title, desc, url, for: ['Algebra', ...] }         last, as the "exam toolkit"
 *
 * Colours for groups and subjects: 'blue' | 'cyan' | 'orange' | 'purple' | 'rose'
 * A subject with no groups is shown as "coming soon".
 */
export function defineSubject(def) {
  const s = {
    color: 'blue',
    icon: 'book',
    steps: DEFAULT_STEPS,
    groups: [],
    revision: [],
    guide: null,
    basics: null,
    ...def,
  };
  s.status = s.groups.length > 0 ? 'active' : 'soon';
  return s;
}
