import Icon from './Icon.jsx';
import { toggleExtra, useProgress } from '../store/progress.js';
import { extraDone, extraKey } from '../lib/selectors.js';

/** A small calculator drawn with SVG. Decorative only. */
function CalculatorArt() {
  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2, 3];
  return (
    <svg className="calc-art" viewBox="0 0 170 214" aria-hidden="true">
      <rect x="8" y="6" width="154" height="200" rx="20" className="ca-body" />
      <rect x="24" y="24" width="122" height="46" rx="10" className="ca-screen" />
      <text x="136" y="58" textAnchor="end" className="ca-digits">3.14159</text>
      {rows.map((r) => cols.map((c) => (
        <rect key={`${r}${c}`} x={24 + c * 31} y={88 + r * 28} width="26" height="21" rx="6"
              className={c === 3 || (r === 3 && c === 2) ? 'ca-key hot' : 'ca-key'} />
      )))}
    </svg>
  );
}

/** The calculator guide, shown at the end of the Roadmap as the exam toolkit. */
export default function ToolkitSection({ subject }) {
  const s = useProgress();
  const g = subject.guide;
  const done = extraDone(s, subject, 'guide');
  return (
    <>
      <div className="gtitle"><h2 className="h2">Exam toolkit</h2><span className="small">Before you start on exam papers</span></div>
      <section className={`toolkit c-${subject.color}`} aria-labelledby="toolkit-title">
        <div className="tk-copy">
          <span className="tk-kicker"><Icon name="calc" size={16} />Calculator guide</span>
          <h3 className="tk-title" id="toolkit-title">{g.title}</h3>
          <p className="tk-desc">{g.desc}</p>
          {g.for && g.for.length > 0 && (
            <ul className="tk-chips" aria-label="Useful for">
              {g.for.map((x) => <li key={x}>{x}</li>)}
            </ul>
          )}
          <div className="tk-actions">
            {g.url
              ? <a className="btn" href={g.url} target="_blank" rel="noopener noreferrer"><Icon name="play" size={16} />Watch the guide</a>
              : <span className="btn off">Link coming soon</span>}
            <button className="btn line" aria-pressed={done} onClick={() => toggleExtra(extraKey(subject, 'guide'))}>
              {done ? <><Icon name="check" size={16} stroke={3} />Watched</> : 'Mark as watched'}
            </button>
          </div>
        </div>
        <CalculatorArt />
      </section>
    </>
  );
}
