import Icon from './Icon.jsx';
import ResourceRow from './ResourceRow.jsx';
import { toggleExtra, useProgress } from '../store/progress.js';
import { extraDone, extraKey } from '../lib/selectors.js';

/** "Start with the basics": one or two videos shown before the curriculum. */
export default function BasicsSection({ subject }) {
  const s = useProgress();
  const b = subject.basics;
  const done = extraDone(s, subject, 'basics');
  const n = b.resources.length;
  return (
    <section className={`start c-${subject.color}`} aria-labelledby="basics-title">
      <span className={`start-mark ${done ? 'done' : ''}`}><Icon name={done ? 'check' : 'flag'} size={done ? 18 : 17} stroke={done ? 3 : 2} /></span>
      <div className="scard">
        <div className="shead">
          <div>
            <h2 className="h2" id="basics-title">{b.title}</h2>
            <p>{b.desc}</p>
          </div>
          {done ? <span className="tag ok">Done</span> : <span className="small">{n} {n === 1 ? 'resource' : 'resources'}</span>}
        </div>
        <ul className="res">
          {b.resources.map((r, i) => <ResourceRow key={i} r={r} />)}
        </ul>
        <div className="sfoot">
          {done
            ? <button className="btn line sm" onClick={() => toggleExtra(extraKey(subject, 'basics'))}>Undo</button>
            : <button className="btn sm" onClick={() => toggleExtra(extraKey(subject, 'basics'))}>Mark basics as done</button>}
        </div>
      </div>
    </section>
  );
}
