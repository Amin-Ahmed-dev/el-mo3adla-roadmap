import Icon from '../components/Icon.jsx';
import ResourceRow from '../components/ResourceRow.jsx';
import ToolkitSection from '../components/ToolkitSection.jsx';
import { toggleRevision, useProgress } from '../store/progress.js';
import { revisionStats } from '../lib/selectors.js';

export default function RevisionPage({ subject }) {
  const s = useProgress();
  const rv = revisionStats(s, subject);

  if (rv.total === 0) {
    return (
      <div className="empty">
        <h1 className="h2">No revision material for {subject.title} yet</h1>
        <p className="small">It will appear here once you add it to the subject file.</p>
        <a className="btn" href={`#/${subject.id}`}>Back to {subject.title}</a>
      </div>
    );
  }
  return (
    <>
      <div className="head">
        <div>
          <p className="small" style={{ marginBottom: 6 }}>{subject.title}</p>
          <h1 className="h1">Revision</h1>
          <p className="lead" style={{ marginTop: 8 }}>Go through each unit, then finish with mixed questions and full exams.</p>
        </div>
        <p className="summary" style={{ margin: 0 }}><b>{rv.done}</b> of {rv.total} items done</p>
      </div>

      <nav className="tabs" aria-label={`${subject.title} sections`} style={{ marginTop: 0, marginBottom: 26 }}>
        <a href={`#/${subject.id}`}>Roadmap</a>
        <a href={`#/${subject.id}/revision`} aria-current="page">Revision</a>
      </nav>

      {subject.guide && <ToolkitSection subject={subject} />}

      {subject.revision.map((g) => (
        <section className="rgroup" key={g.title}>
          <h2 className="h2">{g.title}</h2>
          {g.items.map((it) => {
            const d = !!s.rev[it.id];
            const hasRes = Array.isArray(it.resources) && it.resources.length > 0;
            if (hasRes) {
              // Lesson-style card: header with the check, then video/PDF rows.
              return (
                <div className={`ritem has-res ${d ? 'done' : ''}`} key={it.id}>
                  <div className="rhead">
                    <button className="check" aria-pressed={d} aria-label={`Mark ${it.title} as done`} onClick={() => toggleRevision(it.id)}>
                      <Icon name="check" size={16} stroke={3} />
                    </button>
                    <span className="grow"><b>{it.title}</b><span className="small">{it.unit}, {it.type.toLowerCase()}</span></span>
                    <span className="small">{it.resources.length} {it.resources.length === 1 ? 'resource' : 'resources'}</span>
                  </div>
                  <ul className="res">
                    {it.resources.map((r, i) => <ResourceRow key={i} r={r} />)}
                  </ul>
                </div>
              );
            }
            return (
              <div className={`ritem ${d ? 'done' : ''}`} key={it.id}>
                <button className="check" aria-pressed={d} aria-label={`Mark ${it.title} as done`} onClick={() => toggleRevision(it.id)}>
                  <Icon name="check" size={16} stroke={3} />
                </button>
                <span className="grow"><b>{it.title}</b><span className="small">{it.unit}, {it.type.toLowerCase()}</span></span>
                {it.url
                  ? <a className="btn sm" href={it.url} target="_blank" rel="noopener noreferrer"><Icon name="ext" size={15} />Open</a>
                  : <span className="btn sm off">Link coming soon</span>}
              </div>
            );
          })}
        </section>
      ))}
    </>
  );
}
