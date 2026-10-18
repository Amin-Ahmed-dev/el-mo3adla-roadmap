import { useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import ResourceRow from '../components/ResourceRow.jsx';
import LessonNotes from '../components/LessonNotes.jsx';
import { getLessons, getRevision } from '../data/catalog.js';
import { completeLesson, reopenLesson, setConfidence, setLast, toggleStep, useProgress } from '../store/progress.js';
import { lessonBlockedBy, lessonHref, lessonState, nextInSubject, stepsDone } from '../lib/selectors.js';

const goTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function LessonPage({ lesson: l }) {
  const s = useProgress();
  useEffect(() => { setLast(l.id); }, [l.id]);

  const subject = l.subject;
  const steps = subject.steps;
  const st = lessonState(s, l.id);
  const done = st.done;
  const sd = stepsDone(s, l);
  const list = getLessons(subject);
  const prev = list[l.idx - 1];
  const next = list[l.idx + 1];
  const nxt = nextInSubject(s, subject, l.idx);
  const curStep = steps.find((x) => !st.steps[x.k]);
  const blocker = done ? null : lessonBlockedBy(s, l);
  const hasRevision = getRevision(subject).length > 0;
  const finishHref = hasRevision ? `#/${subject.id}/revision` : `#/${subject.id}`;

  const markStep = (key, wasDone) => {
    if (wasDone) {
      toggleStep(l.id, key);
      return;
    }
    const allDoneNow = steps.every((x) => x.k === key || !!st.steps[x.k]);
    toggleStep(l.id, key);
    if (allDoneNow) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const nextIncomplete = steps.find((x) => x.k !== key && !st.steps[x.k]);
      if (nextIncomplete) setTimeout(() => goTo('step-' + nextIncomplete.k), 60);
    }
  };
  const complete = () => { completeLesson(l.id); window.scrollTo(0, 0); };

  return (
    <>
      <nav className="crumb" aria-label="Breadcrumb">
        <a href={`#/${subject.id}`}>{subject.title}</a><span>/</span><span>{l.unit.title}</span>
        {l.unit.book && (
          l.unit.book.url ? (
            <a
              className="btn sm pdf-btn"
              href={l.unit.book.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 'auto' }}
              title={`Open ${l.unit.book.title || 'Chapter Reference Book'}`}
            >
              <Icon name="file" size={14} />
              <span>{l.unit.book.title || 'Chapter Book'}</span>
              <Icon name="ext" size={12} stroke={2.5} />
            </a>
          ) : (
            <span className="btn sm off" aria-disabled="true" style={{ marginLeft: 'auto' }} title="Book coming soon">
              <Icon name="file" size={14} />
              <span>{l.unit.book.title || 'Chapter Book'}</span>
            </span>
          )
        )}
      </nav>
      <h1 className="h1">{l.title}</h1>
      <p className="lead" style={{ marginTop: 8 }}>
        {l.label} in {l.unit.title.toLowerCase()}. {done ? `All ${steps.length} steps are done.` : `${sd} of ${steps.length} steps done.`}
      </p>

      {!done && blocker && (
        <div className="banner lock-banner">
          <span style={{ color: 'var(--muted)' }}><Icon name="lock" size={22} /></span>
          <div className="grow">
            <b className="h3">Finish “{blocker.title}” first</b>
            <p className="small">Lessons unlock in order — complete the previous lesson before marking this one done. You can still explore the resources below.</p>
          </div>
          <a className="btn sm line" href={lessonHref(blocker)}>Go to previous lesson<Icon name="chev" size={15} stroke={2.6} /></a>
        </div>
      )}
      {done && (
        <div className="banner">
          <span style={{ color: 'var(--ok)' }}><Icon name="check" size={26} stroke={2.8} /></span>
          <div className="grow">
            <b className="h3">Lesson completed</b>
            <p className="small">{nxt && nxt.id !== l.id ? `Next lesson: ${nxt.title}` : `You have finished every ${subject.title} lesson.${hasRevision ? ' Revision is next.' : ''}`}</p>
          </div>
          {nxt && nxt.id !== l.id
            ? <a className="btn" href={lessonHref(nxt)}>Continue<Icon name="chev" size={16} stroke={2.6} /></a>
            : <a className="btn" href={finishHref}>{hasRevision ? 'Go to revision' : `Back to ${subject.title}`}<Icon name="chev" size={16} stroke={2.6} /></a>}
        </div>
      )}

      <div className="cta">
        {done ? (
          <button className="btn line" onClick={() => reopenLesson(l.id)}>
            <Icon name="refresh" size={15} />Reopen this lesson
          </button>
        ) : curStep ? (
          <>
            <button className="btn" onClick={() => goTo('step-' + curStep.k)}>{sd === 0 ? steps[0].cta : curStep.cta}<Icon name="chev" size={16} stroke={2.6} /></button>
            {blocker
              ? <span className="btn line off" aria-disabled="true" title={`Complete “${blocker.title}” first`}><Icon name="lock" size={14} />Mark lesson completed</span>
              : <button className="btn line" onClick={complete}>Mark lesson completed</button>}
          </>
        ) : blocker ? (
          <span className="btn off" aria-disabled="true" title={`Complete “${blocker.title}” first`}><Icon name="lock" size={16} />Complete lesson</span>
        ) : (
          <button className="btn" onClick={complete}><Icon name="check" size={17} stroke={2.8} />Complete lesson</button>
        )}
      </div>

      <div className={`steps c-${l.group.color}`}>
        {steps.map((x, i) => {
          const items = l.res[x.k] || [];
          const sdone = !!st.steps[x.k];
          const nextDone = i + 1 < steps.length && !!st.steps[steps[i + 1].k];
          const isCur = !done && curStep && curStep.k === x.k;
          const req = items.filter((r) => r.req === 'yes').length;
          const count = items.length === 0 ? 'Nothing here yet' : req ? `${req} required` : 'Optional';
          const last = i === steps.length - 1;
          const completesLesson = steps.every((sx) => sx.k === x.k || !!st.steps[sx.k]);
          return (
            <div className={`step ${sdone ? 'done' : ''} ${isCur ? 'cur' : ''} ${sdone || nextDone ? 'seg' : ''}`} id={`step-${x.k}`} key={x.k}>
              <span className="snode">{sdone ? <Icon name="check" size={15} stroke={3} /> : i + 1}</span>
              <div className="scard">
                <div className="shead"><div><h3 className="h3">{x.n}</h3><p>{x.sub}</p></div><span className="small">{count}</span></div>
                <ul className="res">
                  {items.length === 0
                    ? <li><span className="small">Resources for this step will appear here.</span></li>
                    : items.map((r, k) => <ResourceRow key={x.k + k} r={r} />)}
                </ul>
                <div className="sfoot">
                  {sdone
                    ? <button className="btn line sm" onClick={() => markStep(x.k, true)}>Undo</button>
                    : completesLesson && blocker ? (
                      <span className="btn sm off" aria-disabled="true" title={`Complete “${blocker.title}” first`}>
                        <Icon name="lock" size={14} />Done & Complete Lesson
                      </span>
                    ) : (
                      <button className="btn sm" onClick={() => markStep(x.k, false)}>
                        {completesLesson
                          ? <><Icon name="check" size={15} stroke={2.8} />Done & Complete Lesson</>
                          : 'Done, next step'}
                      </button>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <LessonNotes lessonId={l.id} lessonTitle={l.title} />

      <section className="confidence-strip">
        <div className="confidence-strip-info">
          <h2 className="confidence-strip-title">How confident do you feel about this lesson?</h2>
          <p className="confidence-strip-desc">Mark it weak and it shows up under “Topics to review” on the home page.</p>
        </div>
        <div className="conf" role="group" aria-label="Confidence">
          {['weak', 'okay', 'strong'].map((v) => (
            <button key={v} className={v} aria-pressed={st.conf === v} onClick={() => setConfidence(l.id, v)}>{v[0].toUpperCase() + v.slice(1)}</button>
          ))}
        </div>
      </section>

      <div className="pn">
        {prev ? <a href={lessonHref(prev)}><small>Previous lesson</small><b>{prev.title}</b></a> : <span />}
        {next ? <a href={lessonHref(next)}><small>Next lesson</small><b>{next.title}</b></a>
              : <a href={finishHref}><small>After the last lesson</small><b>{hasRevision ? 'Revision' : subject.title}</b></a>}
      </div>
    </>
  );
}
