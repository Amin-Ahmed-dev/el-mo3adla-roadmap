const COLORS = ['blue', 'cyan', 'orange', 'purple', 'rose'];
const REQ = ['yes', 'rec', 'opt'];
const KINDS = ['video', 'pdf'];

/** Checks the content files. Returns { errors, warnings, summary }. Errors stop the build. */
export function validateSubjects(subjects, options = {}) {
  const errors = [];
  const warnings = [];
  const summary = [];
  const subjectIds = new Set();
  const lessonIds = new Map();
  const revIds = new Map();
  const urlUse = new Map();
  const noteUrl = (url, label) => {
    const list = urlUse.get(url) || [];
    list.push(label);
    urlUse.set(url, list);
  };

  // Optional (Node only): scripts/check-content.mjs passes fileExists() so a typo in
  // a bundled path fails the build instead of becoming a dead link for students.
  // Without it (in the browser) this check is skipped.
  const fileExists = typeof options.fileExists === 'function' ? options.fileExists : null;
  const checkLocalFile = (url, where) => {
    if (!fileExists || typeof url !== 'string') return;
    if (url.startsWith('//')) return; // protocol-relative web link
    if (!url.startsWith('./') && !url.startsWith('/')) return; // only bundled paths
    if (!fileExists(url)) errors.push(`${where} points to a missing local file: ${url}`);
  };

  for (const s of subjects) {
    const at = `[${s.id || '?'}]`;
    if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) errors.push(`${at} subject id must be lowercase letters, numbers and dashes`);
    if (subjectIds.has(s.id)) errors.push(`${at} duplicate subject id`);
    subjectIds.add(s.id);
    if (!s.title) errors.push(`${at} missing title`);
    if (!COLORS.includes(s.color)) errors.push(`${at} unknown colour "${s.color}"`);
    if (s.status !== 'active') {
      summary.push({ id: s.id, title: s.title, status: 'soon', lessons: 0, linked: 0, slots: 0 });
      continue;
    }

    const stepKeys = (s.steps || []).map((x) => x.k);
    if (stepKeys.length === 0) errors.push(`${at} needs at least one step`);
    let lessons = 0, slots = 0, linked = 0;

    for (const g of s.groups) {
      if (!COLORS.includes(g.color)) errors.push(`${at} group "${g.title}" has unknown colour "${g.color}"`);
      if (!g.units || g.units.length === 0) errors.push(`${at} group "${g.title}" has no units`);
      for (const u of g.units || []) {
        if (!u.lessons || u.lessons.length === 0) errors.push(`${at} unit "${u.title}" has no lessons`);
        if (u.book) {
          slots++;
          if (u.book.url) {
            linked++;
            const okUrl = /^(https?:\/\/|\.?\/)/i.test(u.book.url);
            if (!okUrl) errors.push(`${at} unit "${u.title}" book link must be a web link or a bundled file path starting with ./`);
            noteUrl(u.book.url, `${u.id} (book)`);
            checkLocalFile(u.book.url, `${at} unit "${u.title}" book`);
          }
        }
        for (const l of u.lessons || []) {
          lessons++;
          const where = `${at} lesson "${l.id}"`;
          if (!l.id || !l.title || !l.label) errors.push(`${where} needs id, label and title`);
          if (lessonIds.has(l.id)) errors.push(`${where} is also used in ${lessonIds.get(l.id)}. Lesson ids must be unique`);
          lessonIds.set(l.id, s.id);
          for (const key of Object.keys(l.res || {})) {
            if (!stepKeys.includes(key)) errors.push(`${where} has resources for "${key}", which is not a step of this subject`);
          }
          for (const key of stepKeys) {
            const list = (l.res || {})[key] || [];
            if (list.length === 0) warnings.push(`${where} has nothing in step "${key}"`);
            for (const r of list) {
              slots++;
              if (!r.t) errors.push(`${where} has a resource with no title in "${key}"`);
              if (!KINDS.includes(r.k)) errors.push(`${where} resource "${r.t}" has kind "${r.k}"`);
              if (!REQ.includes(r.req)) errors.push(`${where} resource "${r.t}" has req "${r.req}"`);
              if (r.u) {
                linked++;
                const okUrl = r.k === 'pdf' ? /^(https?:\/\/|\.?\/)/i.test(r.u) : /^https?:\/\//i.test(r.u);
                if (!okUrl) errors.push(`${where} resource "${r.t}" link must be a web link, or for a PDF a bundled file path starting with ./`);
                noteUrl(r.u, `${l.id} (${r.t})`);
                checkLocalFile(r.u, `${where} resource "${r.t}"`);
              }
            }
          }
        }
      }
    }
    for (const g of s.revision) {
      for (const it of g.items) {
        const where = `${at} revision "${it.id}"`;
        if (!it.id || !it.title) errors.push(`${where} needs id and title`);
        if (revIds.has(it.id)) errors.push(`${where} is also used in ${revIds.get(it.id)}. Revision ids must be unique`);
        revIds.set(it.id, s.id);
        slots++;
        if (it.url) {
          linked++;
          if (!/^https?:\/\//i.test(it.url)) errors.push(`${where} link must start with http:// or https://`);
          noteUrl(it.url, `${it.id} (revision)`);
        }
        if (it.resources !== undefined) {
          if (!Array.isArray(it.resources) || it.resources.length === 0) {
            errors.push(`${where} has an empty resources list`);
          }
          for (const r of it.resources || []) {
            slots++;
            if (!r.t) errors.push(`${where} has a resource with no title`);
            if (!KINDS.includes(r.k)) errors.push(`${where} resource "${r.t}" has kind "${r.k}"`);
            if (!REQ.includes(r.req)) errors.push(`${where} resource "${r.t}" has req "${r.req}"`);
            if (r.u) {
              linked++;
              const okUrl = r.k === 'pdf' ? /^(https?:\/\/|\.?\/)/i.test(r.u) : /^https?:\/\//i.test(r.u);
              if (!okUrl) errors.push(`${where} resource "${r.t}" link must be a web link, or for a PDF a bundled file path starting with ./`);
              noteUrl(r.u, `${it.id} (${r.t})`);
              checkLocalFile(r.u, `${where} resource "${r.t}"`);
            }
          }
        }
      }
    }
    if (s.basics) {
      const bw = `${at} basics`;
      if (!s.basics.title) errors.push(`${bw} needs a title`);
      if (!Array.isArray(s.basics.resources) || s.basics.resources.length === 0) errors.push(`${bw} needs at least one resource`);
      for (const r of s.basics.resources || []) {
        slots++;
        if (!r.t) errors.push(`${bw} has a resource with no title`);
        if (!KINDS.includes(r.k)) errors.push(`${bw} resource "${r.t}" has kind "${r.k}"`);
        if (!REQ.includes(r.req)) errors.push(`${bw} resource "${r.t}" has req "${r.req}"`);
        if (r.u) {
          linked++;
          const okUrl = r.k === 'pdf' ? /^(https?:\/\/|\.?\/)/i.test(r.u) : /^https?:\/\//i.test(r.u);
          if (!okUrl) errors.push(`${bw} resource "${r.t}" link must start with http:// or https://, or for a PDF a bundled file path starting with ./`);
          noteUrl(r.u, `basics (${r.t})`);
          checkLocalFile(r.u, `${bw} resource "${r.t}"`);
        }
      }
    }
    if (s.guide) {
      slots++;
      if (!s.guide.title) errors.push(`${at} guide needs a title`);
      if (s.guide.url) {
        linked++;
        if (!/^https?:\/\//i.test(s.guide.url)) errors.push(`${at} guide link must start with http:// or https://`);
        noteUrl(s.guide.url, 'guide');
      }
    }
    summary.push({ id: s.id, title: s.title, status: 'active', lessons, linked, slots });
  }
  for (const [url, uses] of urlUse) {
    if (uses.length > 1) warnings.push(`the same link is used ${uses.length} times: ${uses.join(', ')}  (${url})`);
  }
  return { errors, warnings, summary };
}
