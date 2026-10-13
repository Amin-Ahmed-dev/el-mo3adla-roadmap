import { useEffect, useState } from 'react';
import { subjectById, lessonById } from '../data/catalog.js';

/** Routes:  #/  ·  #/:subject  ·  #/:subject/lesson/:id  ·  #/:subject/revision   (#/revision still works) */
export function parseHash(hash) {
  const parts = (hash.replace(/^#/, '') || '/').split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'revision' && parts.length === 1) return { name: 'legacy-revision' };
  const subject = subjectById[parts[0]];
  if (!subject) return { name: 'notfound' };
  if (parts.length === 1) return { name: 'subject', subject };
  if (parts[1] === 'revision' && parts.length === 2) return { name: 'revision', subject };
  if (parts[1] === 'lesson' && parts.length === 3) {
    const lesson = lessonById[parts[2]];
    if (lesson && lesson.subject.id === subject.id) return { name: 'lesson', subject, lesson };
  }
  return { name: 'notfound' };
}

export function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return { ...parseHash(hash), hash };
}
