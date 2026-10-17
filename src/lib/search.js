import { ACTIVE, getLessons, getRevision } from '../data/catalog.js';
import { lessonHref } from './selectors.js';

let index = null;
function build() {
  const ix = [];
  for (const sub of ACTIVE) {
    for (const l of getLessons(sub)) {
      ix.push({ type: 'Lesson', icon: sub.icon, title: l.title, meta: `${sub.title}, ${l.unit.title}`, href: lessonHref(l),
                hay: `${l.title} ${l.unit.title} ${l.label} ${sub.title}`.toLowerCase() });
      for (const step of sub.steps) {
        for (const r of l.res[step.k] || []) {
          ix.push({ type: r.k === 'pdf' ? 'PDF' : 'Video', icon: r.k === 'pdf' ? 'file' : 'play', title: r.t, meta: `${sub.title}, ${l.title}`,
                    href: lessonHref(l), hay: `${r.t} ${l.title} ${step.n} ${sub.title}`.toLowerCase() });
        }
      }
    }
    for (const r of getRevision(sub)) {
      ix.push({ type: 'Revision', icon: 'revise', title: r.title, meta: `${sub.title}, ${r.group}`, href: `#/${sub.id}/revision`,
                hay: `${r.title} ${r.group} ${r.type} ${sub.title}`.toLowerCase() });
      for (const res of r.resources || []) {
        ix.push({ type: res.k === 'pdf' ? 'PDF' : 'Video', icon: res.k === 'pdf' ? 'file' : 'play', title: res.t, meta: `${sub.title}, ${r.title}`,
                  href: `#/${sub.id}/revision`, hay: `${res.t} ${r.title} ${r.group} ${sub.title}`.toLowerCase() });
      }
    }
    if (sub.basics) {
      for (const r of sub.basics.resources) {
        ix.push({ type: r.k === 'pdf' ? 'PDF' : 'Video', icon: r.k === 'pdf' ? 'file' : 'play', title: r.t, meta: `${sub.title}, ${sub.basics.title}`,
                  href: `#/${sub.id}`, hay: `${r.t} ${sub.basics.title} basics ${sub.title}`.toLowerCase() });
      }
    }
    if (sub.guide) ix.push({ type: 'Guide', icon: 'calc', title: sub.guide.title, meta: sub.title, href: `#/${sub.id}`, hay: `${sub.guide.title} ${sub.title} calculator`.toLowerCase() });
  }
  return ix;
}

export function search(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (!index) index = build();
  const toks = q.split(/\s+/);
  const rank = (x) => (x.type === 'Lesson' ? 0 : 1) * 2 + (x.title.toLowerCase().startsWith(q) ? 0 : 1);
  return index.filter((x) => toks.every((t) => x.hay.includes(t))).sort((a, b) => rank(a) - rank(b)).slice(0, 12);
}
