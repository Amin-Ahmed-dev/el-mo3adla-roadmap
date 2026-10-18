import { useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import ResourceRow from '../components/ResourceRow.jsx';
import { toggleRevision, useProgress } from '../store/progress.js';
import { revisionStats } from '../lib/selectors.js';

const TYPE_ICON = { 'Topic revision': 'book', 'Mixed questions': 'pencil', 'Previous exams': 'file', 'Full exams': 'cap', Formulas: 'formula', 'Calculator practice': 'calc' };

function ItemResources({ item }) {
  const list = item.resources || [];
  if (list.length > 0) return (<ul className="res">{list.map((r, k) => <ResourceRow key={k} r={r} />)}</ul>);
  if (item.url) return (<ul className="res"><li className="res-item is-video"><span className="ric video-ric"><Icon name="play" size={17} /></span><span className="grow"><b className="res-title">{item.title} — video</b></span><a className="btn sm video-btn" href={item.url} target="_blank" rel="noopener noreferrer"><Icon name="play" size={14} /><span>Watch Video</span><Icon name="ext" size={12} stroke={2.5} /></a></li></ul>);
  return (<div className="rev-empty-res"><Icon name="timer" size={14} />Resources coming soon</div>);
}


function RevItem({ item, done, index }) {
  const [open, setOpen] = useState(false);
  const hasRes = (item.resources && item.resources.length > 0) || !!item.url;
  return (
    <div className={`rev-step ${done ? 'done' : ''}`}>
      <button className={`rev-node ${done ? 'done' : ''}`} onClick={() => toggleRevision(item.id)} aria-pressed={!!done} title={done ? 'Mark as not done' : 'Mark as done'}>{done ? <Icon name="check" size={14} stroke={3} /> : index + 1}</button>
      <div className="scard rev-card">
        {hasRes ? (
        <button className="rev-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span className="rev-ic"><Icon name={TYPE_ICON[item.type] || 'revise'} size={17} /></span>
          <span className="grow"><b>{item.title}</b><span className="small">{item.unit}{item.type ? ` • ${item.type}` : ''}</span></span>
          <span className="meta">{done ? <span className="tag ok"><Icon name="check" size={12} />Done</span> : <span className="tag rec">{item.type || 'Revision'}</span>}<span className={`rev-chev ${open ? 'open' : ''}`}><Icon name="chev" size={15} stroke={2.6} /></span></span>
        </button>
        ) : (
        <div className="rev-head" aria-hidden="false">
          <span className="rev-ic"><Icon name={TYPE_ICON[item.type] || 'revise'} size={17} /></span>
          <span className="grow"><b>{item.title}</b><span className="small">{item.unit}{item.type ? ` • ${item.type}` : ''}</span></span>
          <span className="meta">{done ? <span className="tag ok"><Icon name="check" size={12} />Done</span> : <span className="tag rec">{item.type || 'Revision'}</span>}</span>
        </div>
        )}
        {hasRes && open && (<div className="rev-body"><ItemResources item={item} /></div>)}
        <div className="sfoot rev-foot"><span className="small">{done ? 'Completed.' : hasRes ? 'Open it, study, then mark it done.' : 'Mark it done after you revise it.'}</span>{done ? <button className="btn line sm" onClick={() => toggleRevision(item.id)}>Undo</button> : <button className="btn sm" onClick={() => toggleRevision(item.id)}><Icon name="check" size={15} stroke={2.8} />Mark as done</button>}</div>
      </div>
    </div>
  );
}
export default function RevisionPage({ subject }) {
  const s = useProgress();
  const [filter, setFilter] = useState('all');
  const [collapsed, setCollapsed] = useState({});
  const rv = revisionStats(s, subject);
  const pct = rv.total ? Math.round((rv.done / rv.total) * 100) : 0;
  const expandAll = () => setCollapsed({});
  const collapseAll = () => {
    const all = {};
    (subject.revision || []).forEach((_, i) => { all[i] = true; });
    setCollapsed(all);
  };
  const groups = useMemo(() => (subject.revision || []).map((g, gi) => {
    const items = g.items.filter((it) => (filter === 'done' ? !!s.rev[it.id] : filter === 'remaining' ? !s.rev[it.id] : true));
    const d = g.items.filter((it) => s.rev[it.id]).length;
    return { ...g, gi, items, done: d, total: g.items.length };
  }), [subject, s.rev, filter]);
  const next = useMemo(() => {
    for (const g of (subject.revision || [])) for (const it of g.items) if (!s.rev[it.id]) return { ...it, group: g.title };
    return null;
  }, [subject, s.rev]);
  if (!subject.revision || subject.revision.length === 0) return (<div className="empty"><h2 className="h2">No revision yet</h2><p className="small">Revision packs for {subject.title} are being prepared.</p><a className="btn" href={`#/${subject.id}`}>Back to roadmap</a></div>);
  return (
    <>
      <nav className="crumb" aria-label="Breadcrumb"><a href={`#/${subject.id}`}>{subject.title}</a><span>/</span><span>Revision</span></nav>
      <div className="head">
        <div><span className={`tag c-${subject.color}`} style={{ marginBottom: 8, display: 'inline-flex', gap: 6 }}><Icon name="revise" size={14} />{subject.title} Revision</span><h1 className="h1">Exam revision</h1><p className="lead" style={{ marginTop: 8 }}>Same study flow as lessons — open each pack, revise, then mark it done.</p></div>
        <div className="head-actions"><div className="subject-progress-pill"><div className="spp-chart"><b>{pct}%</b></div><div><b style={{ display: 'block', fontSize: 15 }}>{rv.done} of {rv.total} done</b><span className="small">{rv.total - rv.done} packs remaining</span></div></div></div>
      </div>
      {next && (<div className="next-banner rev-next"><div className="nb-badge"><Icon name="play" size={16} /></div><div className="nb-info"><span className="nb-label">UP NEXT IN REVISION</span><b className="nb-title">{next.title}</b><span className="small">{next.group} • {next.unit}</span></div><button className="btn sm" onClick={() => toggleRevision(next.id)}><Icon name="check" size={15} stroke={2.8} />Mark done</button></div>)}
      <div className="roadmap-controls">
        <div className="filter-pill-group" role="group" aria-label="Filter revision packs">
          <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({rv.total})</button>
          <button className={`filter-pill ${filter === 'remaining' ? 'active' : ''}`} onClick={() => setFilter('remaining')}>Remaining ({rv.total - rv.done})</button>
          <button className={`filter-pill ${filter === 'done' ? 'active' : ''}`} onClick={() => setFilter('done')}>Done ({rv.done})</button>
        </div>
        <div className="collapse-btns">
          <button className="mini-toggle" onClick={expandAll} title="Expand all packs">Expand All</button>
          <span className="sep">|</span>
          <button className="mini-toggle" onClick={collapseAll} title="Collapse all packs">Collapse All</button>
        </div>
      </div>
      <div className={`rev-steps c-${subject.color}`}>
        {groups.map((g) => {
          const isCol = !!collapsed[g.gi];
          let n = 0;
          return (
            <section className="rev-group" key={g.gi}>
              <div className="unit-header-clean"><div className="unit-info-clean" onClick={() => setCollapsed((p) => ({ ...p, [g.gi]: !p[g.gi] }))} style={{ cursor: 'pointer' }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCollapsed((p) => ({ ...p, [g.gi]: !p[g.gi] })); }} aria-expanded={!isCol}><span className={`unit-indicator-badge tag c-${subject.color}`}>Pack {g.gi + 1}</span><h2 className="unit-title-clean">{g.title}</h2><span className="unit-toggle-chevron" style={{ transform: isCol ? 'rotate(-90deg)' : 'none' }}><Icon name="chev" size={16} stroke={2.4} /></span></div><div className="unit-actions-clean"><span className="small">{g.done}/{g.total} done</span><span className="bar" style={{ width: 90 }}><i style={{ width: `${g.total ? Math.round((g.done / g.total) * 100) : 0}%` }} /></span></div></div>
              {!isCol && (g.items.length === 0 ? <p className="small" style={{ padding: '4px 2px 14px' }}>Nothing in this filter.</p> : g.items.map((it) => { n += 1; return <RevItem key={it.id} item={it} done={!!s.rev[it.id]} index={n - 1} />; }))}
            </section>
          );
        })}
      </div>
      <div className="pn"><a href={`#/${subject.id}`}><small>Back to</small><b>{subject.title} roadmap</b></a><a href="#/"><small>Finished revising?</small><b>Back to home</b></a></div>
    </>
  );
}

