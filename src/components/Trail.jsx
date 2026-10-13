import Node from './Node.jsx';
import { useProgress } from '../store/progress.js';
import { getLessons } from '../data/catalog.js';
import { lessonState, lessonHref } from '../lib/selectors.js';

/** The whole route of a subject as a row of dots, grouped and coloured. */
export default function Trail({ subject }) {
  const s = useProgress();
  const lessons = getLessons(subject);
  const counts = subject.groups.map((g) => lessons.filter((l) => l.group.id === g.id).length);
  return (
    <div className="trail-scroll">
      <div style={{ minWidth: lessons.length * 26, maxWidth: Math.max(lessons.length * 72, 280) }}>
        <div className="trail" role="list" style={{ gridTemplateColumns: `repeat(${lessons.length}, minmax(26px, 1fr))` }}
             aria-label={`${subject.title} route`}>
          {lessons.map((l, i) => {
            const prevDone = i > 0 && lessonState(s, lessons[i - 1].id).done;
            const ownDone = lessonState(s, l.id).done;
            return (
              <a key={l.id} role="listitem" className={`tn c-${l.group.color} ${prevDone || ownDone ? 'seg' : ''}`}
                 href={lessonHref(l)} aria-label={l.title} title={l.title}>
                <Node lesson={l} />
              </a>
            );
          })}
        </div>
        <div className="groups" style={{ gridTemplateColumns: counts.map((c) => `${c}fr`).join(' ') }}>
          {subject.groups.map((g) => <span key={g.id} className={`c-${g.color}`}>{g.title}</span>)}
        </div>
      </div>
    </div>
  );
}
