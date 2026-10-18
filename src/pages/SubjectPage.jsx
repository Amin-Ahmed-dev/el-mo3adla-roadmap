import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import Node from '../components/Node.jsx';
import BasicsSection from '../components/BasicsSection.jsx';
import ToolkitSection from '../components/ToolkitSection.jsx';
import { getLessons } from '../data/catalog.js';
import { useProgress } from '../store/progress.js';
import { continueTarget, lessonBlockedBy, lessonHref, lessonState, nextInSubject, revisionStats, status, stepsDone, subjectStats } from '../lib/selectors.js';
import ComingSoon from './ComingSoon.jsx';

export default function SubjectPage({ subject, onOpenFormulas }) {
  const s = useProgress();
  const [filter, setFilter] = useState('all'); // 'all' | 'remaining' | 'done'
  const [collapsedUnits, setCollapsedUnits] = useState({});

  if (subject.status !== 'active') return <ComingSoon subject={subject} />;

  const lessons = getLessons(subject);
  const st = subjectStats(s, subject);
  const rv = revisionStats(s, subject);
  const nx = continueTarget(s);
  const subjectNext = nextInSubject(s, subject);

  const toggleUnit = (uId) => {
    setCollapsedUnits((prev) => ({ ...prev, [uId]: !prev[uId] }));
  };

  const expandAll = () => setCollapsedUnits({});
  const collapseAll = () => {
    const all = {};
    subject.groups.forEach((g) => g.units.forEach((u) => { all[u.id] = true; }));
    setCollapsedUnits(all);
  };

  return (
    <>
      {/* Subject Header */}
      <div className="head">
        <div>
          <span className={`tag c-${subject.color}`} style={{ marginBottom: 8, display: 'inline-flex', gap: 6 }}>
            <Icon name={subject.icon} size={14} />{subject.title} Curriculum
          </span>
          <h1 className="h1">{subject.title}</h1>
          <p className="lead" style={{ marginTop: 8 }}>{subject.desc}. Complete each chapter step-by-step.</p>
        </div>
        <div className="head-actions">
          <div className="subject-progress-pill">
            <div className="spp-chart">
              <b>{st.pct}%</b>
            </div>
            <div>
              <b style={{ display: 'block', fontSize: 15 }}>{st.done} of {st.total} done</b>
              <span className="small">{st.total - st.done} lessons remaining</span>
            </div>
          </div>
          {onOpenFormulas && (
            <button className="btn sm line" onClick={onOpenFormulas} style={{ fontSize: 13, alignSelf: 'flex-start' }}>
              <Icon name="formula" size={14} />Formulas sheet<kbd className="inline-kbd">F</kbd>
            </button>
          )}
        </div>
      </div>

      {/* Up Next in this Subject Banner */}
      {subjectNext && (
        <div className="next-banner">
          <div className="nb-badge">
            <Icon name="play" size={16} />
          </div>
          <div className="nb-info">
            <span className="nb-label">NEXT LESSON IN {subject.title.toUpperCase()}</span>
            <b className="nb-title">{subjectNext.title}</b>
            <span className="small">{subjectNext.unit.title} • {subjectNext.label}</span>
          </div>
          <a className="btn sm" href={lessonHref(subjectNext)}>
            Resume Lesson<Icon name="chev" size={15} stroke={2.6} />
          </a>
        </div>
      )}

      {/* Navigation Tabs & Controls */}
      <div className="roadmap-controls">
        {rv.total > 0 ? (
          <nav className="tabs" aria-label={`${subject.title} sections`} style={{ margin: 0 }}>
            <a href={`#/${subject.id}`} aria-current="page">Roadmap</a>
            <a href={`#/${subject.id}/revision`}>Revision</a>
          </nav>
        ) : <div />}

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Quick Lesson Filter */}
          <div className="filter-pill-group" role="group" aria-label="Filter lessons">
            <button
              className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({st.total})
            </button>
            <button
              className={`filter-pill ${filter === 'remaining' ? 'active' : ''}`}
              onClick={() => setFilter('remaining')}
            >
              Remaining ({st.total - st.done})
            </button>
            <button
              className={`filter-pill ${filter === 'done' ? 'active' : ''}`}
              onClick={() => setFilter('done')}
            >
              Done ({st.done})
            </button>
          </div>

          {/* Expand / Collapse All */}
          <div className="collapse-btns">
            <button className="mini-toggle" onClick={expandAll} title="Expand all chapters">Expand All</button>
            <span className="sep">|</span>
            <button className="mini-toggle" onClick={collapseAll} title="Collapse all chapters">Collapse All</button>
          </div>
        </div>
      </div>

      {subject.basics && <BasicsSection subject={subject} />}

      {subject.groups.map((g) => {
        const gLessons = lessons.filter((l) => l.group === g);
        const gDone = gLessons.filter((l) => lessonState(s, l.id).done).length;
        const gPct = gLessons.length > 0 ? Math.round((gDone / gLessons.length) * 100) : 0;

        return (
          <div key={g.id} className="group-wrapper">
            <div className="gtitle">
              <div>
                <h2 className="h2">{g.title}</h2>
                <span className="small">{gDone} of {gLessons.length} lessons mastered ({gPct}%)</span>
              </div>
              <div className="gtitle-bar">
                <div className="bar" style={{ width: 140, margin: 0 }}><i style={{ width: `${gPct}%` }} /></div>
              </div>
            </div>

            {g.units.map((u) => {
              const ul = lessons.filter((l) => l.unit === u);
              const ud = ul.filter((l) => lessonState(s, l.id).done).length;
              const uPct = ul.length > 0 ? Math.round((ud / ul.length) * 100) : 0;
              const isCollapsed = !!collapsedUnits[u.id];

              const visibleLessons = ul.filter((l) => {
                const isDone = lessonState(s, l.id).done;
                if (filter === 'remaining') return !isDone;
                if (filter === 'done') return isDone;
                return true;
              });

              if (visibleLessons.length === 0 && filter !== 'all') return null;

              return (
                <section className="unit" key={u.id}>
                  {/* Clean Borderless Chapter Header */}
                  <div className="unit-header-clean">
                    <div className="unit-info-clean" onClick={() => toggleUnit(u.id)} style={{ cursor: 'pointer' }}>
                      <span className="unit-indicator-badge" style={{ background: uPct === 100 ? 'var(--ok-tint)' : 'var(--brand-tint)', color: uPct === 100 ? 'var(--ok)' : 'var(--brand)' }}>
                        {uPct === 100 ? <Icon name="check" size={13} stroke={3} /> : `${uPct}%`}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h3 className="h3 unit-title-clean">{u.title}</h3>
                          <span
                            className="unit-toggle-chevron"
                            style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
                            title={isCollapsed ? 'Expand chapter' : 'Collapse chapter'}
                          >
                            <Icon name="chev" size={14} stroke={2.5} />
                          </span>
                        </div>
                        <span className="small">{ud} of {ul.length} lessons completed</span>
                      </div>
                    </div>

                    <div className="unit-actions-clean">
                      {u.book && (
                        u.book.url ? (
                          <a
                            className="btn sm pdf-btn"
                            href={u.book.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Open ${u.book.title || 'Chapter Reference Book'}`}
                          >
                            <Icon name="file" size={14} />
                            <span>{u.book.title || 'Chapter Book'}</span>
                            <Icon name="ext" size={12} stroke={2.5} />
                          </a>
                        ) : (
                          <span className="btn sm off" aria-disabled="true" title="Book coming soon">
                            <Icon name="file" size={14} />
                            <span>{u.book.title || 'Chapter Book'}</span>
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Chapter Lessons Route (Natural, open, unboxed) */}
                  {!isCollapsed && (
                    <div className={`route c-${g.color}`}>
                      {visibleLessons.map((l, i) => {
                        const state = status(s, l);
                        const blocker = state === 'done' ? null : lessonBlockedBy(s, l);
                        const isNext = nx && nx.id === l.id && state !== 'done';
                        const prevDone = i > 0 && lessonState(s, visibleLessons[i - 1].id).done;
                        const sd = stepsDone(s, l);
                        const cf = lessonState(s, l.id).conf;
                        const hasNote = s.notes && !!s.notes[l.id];

                        return (
                          <div className={`stop ${prevDone || state === 'done' ? 'seg' : ''}`} key={l.id}>
                            <Node lesson={l} />
                            <a className={`stopcard ${isNext ? 'isnext' : ''}`} href={lessonHref(l)}>
                              <span className="grow">
                                <b>{l.title}</b>
                                <span className="small">{l.label}</span>
                              </span>
                              <span className="meta">
                                {hasNote && (
                                  <span className="tag opt note-tag" title="You have personal study notes saved">
                                    <Icon name="notes" size={12} />Notes
                                  </span>
                                )}
                                {cf && <span className={`tag ${cf === 'weak' ? 'bad' : cf === 'okay' ? 'warn' : 'ok'}`}>{cf[0].toUpperCase() + cf.slice(1)}</span>}
                                {blocker && (
                                  <span className="tag opt" title={`Locked — finish “${blocker.title}” first`}><Icon name="lock" size={12} />Locked</span>
                                )}
                                {state === 'done' ? <span className="tag ok"><Icon name="check" size={12} />Done</span>
                                  : isNext ? <span className="tag next">Next up</span>
                                  : state === 'prog' ? <span className="tag warn">In progress</span> : null}
                                <span className="pips" role="img" aria-label={`${sd} of ${subject.steps.length} steps done`}>
                                  {subject.steps.map((x) => <i key={x.k} className={lessonState(s, l.id).steps[x.k] ? 'on' : ''} />)}
                                </span>
                              </span>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        );
      })}

      {subject.guide && <ToolkitSection subject={subject} />}
    </>
  );
}
