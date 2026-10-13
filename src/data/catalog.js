import { SUBJECTS_LIST } from './subjects/index.js';

/** Derived lookups. Nothing here is edited by hand. */
export const SUBJECTS = SUBJECTS_LIST;
export const ACTIVE = SUBJECTS.filter((s) => s.status === 'active');
export const subjectById = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));

export const lessonsOf = {};   // subject id -> flat lessons in order
export const lessonById = {};  // lesson id  -> lesson (with subject, group, unit, idx)
export const revisionOf = {};  // subject id -> flat revision items

for (const s of ACTIVE) {
  const flat = [];
  for (const g of s.groups) {
    for (const u of g.units) {
      for (const l of u.lessons) {
        const item = { ...l, subject: s, group: g, unit: u, idx: flat.length };
        flat.push(item);
        lessonById[l.id] = item;
      }
    }
  }
  lessonsOf[s.id] = flat;
  revisionOf[s.id] = s.revision.flatMap((g) => g.items.map((it) => ({ ...it, group: g.title })));
}

export const getLessons = (s) => lessonsOf[s.id] || [];
export const getRevision = (s) => revisionOf[s.id] || [];
