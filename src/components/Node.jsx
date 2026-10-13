import Icon from './Icon.jsx';
import { useProgress } from '../store/progress.js';
import { continueTarget, status } from '../lib/selectors.js';

/** The round marker on the route: done, next, in progress or not started. */
export default function Node({ lesson }) {
  const s = useProgress();
  const st = status(s, lesson);
  const nx = continueTarget(s);
  const isNext = nx && nx.id === lesson.id && st !== 'done';
  const cls = st === 'done' ? 'done' : isNext ? 'next' : st === 'prog' ? 'prog' : '';
  return (
    <span className={`node ${cls}`}>
      {st === 'done' && <Icon name="check" size={12} stroke={3.4} />}
    </span>
  );
}
