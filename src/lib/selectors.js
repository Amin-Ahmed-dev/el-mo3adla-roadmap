import { ACTIVE, lessonById, getLessons, getRevision } from '../data/catalog.js';

/** Pure functions: (progress state, data) -> derived numbers. Nothing here touches the DOM. */
const EMPTY = { steps: {}, done: false, conf: null };

export const lessonState = (s, id) => s.lessons[id] || EMPTY;
export const stepsDone = (s, lesson) => lesson.subject.steps.filter((x) => lessonState(s, lesson.id).steps[x.k]).length;
export const status = (s, lesson) => (lessonState(s, lesson.id).done ? 'done' : stepsDone(s, lesson) > 0 ? 'prog' : 'todo');

export function subjectStats(s, subject) {
  const lessons = getLessons(subject);
  const done = lessons.filter((l) => lessonState(s, l.id).done).length;
  const total = lessons.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

/**
 * One subject's own next step, independent of any other subject.
 * Used on its card so the homepage stays accurate with any number of subjects,
 * instead of naming a single subject in one shared headline.
 */
export function subjectNextStep(s, subject) {
  const { done, total } = subjectStats(s, subject);
  if (total === 0) return { label: 'No lessons yet', tone: 'muted' };
  if (done >= total) return { label: 'All lessons done', tone: 'done' };
  if (subject.basics && !extraDone(s, subject, 'basics')) return { label: 'Start with the basics', tone: 'start' };
  const n = nextInSubject(s, subject, -1);
  if (done === 0) return { label: n ? `Start: ${n.title}` : 'Start', tone: 'start' };
  return { label: n ? `Continue: ${n.title}` : 'Continue', tone: 'progress' };
}
export function revisionStats(s, subject) {
  const items = getRevision(subject);
  return { done: items.filter((r) => s.rev[r.id]).length, total: items.length };
}
export function overallStats(s) {
  let done = 0, total = 0, rDone = 0, rTotal = 0;
  for (const sub of ACTIVE) {
    const a = subjectStats(s, sub), b = revisionStats(s, sub);
    done += a.done; total += a.total; rDone += b.done; rTotal += b.total;
  }
  return { done, total, rDone, rTotal, pct: total ? Math.round((done / total) * 100) : 0 };
}

/** First lesson of `subject` that is not done, searching after index i and then wrapping. */
export function nextInSubject(s, subject, i) {
  const list = getLessons(subject);
  for (let k = i + 1; k < list.length; k++) if (!lessonState(s, list[k].id).done) return list[k];
  for (let k = 0; k <= i && k < list.length; k++) if (!lessonState(s, list[k].id).done) return list[k];
  return null;
}

/** Where the "Continue" button should go. */
export function continueTarget(s) {
  const last = s.last && lessonById[s.last];
  if (last) {
    if (!lessonState(s, last.id).done) return last;
    const n = nextInSubject(s, last.subject, last.idx);
    if (n) return n;
  }
  for (const sub of ACTIVE) {
    const n = nextInSubject(s, sub, -1);
    if (n) return n;
  }
  return null;
}

export const weakLessons = (s) => ACTIVE.flatMap((sub) => getLessons(sub)).filter((l) => lessonState(s, l.id).conf === 'weak');
export const hasStarted = (s) => !!s.last || Object.keys(s.lessons).length > 0;

export function examInfo(s) {
  if (!s.exam) return null;
  const d = new Date(s.exam + 'T00:00:00');
  if (isNaN(d)) return null;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return { days: Math.round((d - t) / 864e5) };
}
export const effectiveTheme = (t) => t || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
/** Key used to remember that a student finished a subject's basics or watched its guide. */
export const extraKey = (subject, kind) => `${subject.id}:${kind}`;
export const extraDone = (s, subject, kind) => !!s.extras[extraKey(subject, kind)];
export const lessonHref = (l) => `#/${l.subject.id}/lesson/${l.id}`;
