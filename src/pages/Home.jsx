import DailyMotivation from '../components/DailyMotivation.jsx';
import CountUp from '../components/CountUp.jsx';
import Trail from '../components/Trail.jsx';
import { ACTIVE, SUBJECTS } from '../data/catalog.js';
import { setExam, useProgress } from '../store/progress.js';
import { useSession } from '../store/session.js';
import { isCloudConfigured } from '../lib/supabase.js';
import Icon from '../components/Icon.jsx';
import { continueTarget, examInfo, extraDone, hasStarted, lessonHref, overallStats, subjectNextStep, subjectStats, weakLessons } from '../lib/selectors.js';

function getGreeting() {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home({ onOpenFormulas, onSignIn }) {
  const s = useProgress();
  const { status } = useSession();
  const nx = continueTarget(s);
  const o = overallStats(s);
  const started = hasStarted(s);
  const weak = weakLessons(s);
  const ex = examInfo(s);
  const remaining = o.total - o.done;
  const heroSubject = nx ? nx.subject : ACTIVE[0];
  const basicsFirst = !started && nx && nx.subject.basics && !extraDone(s, nx.subject, 'basics');
  const soon = SUBJECTS.filter((x) => x.status !== 'active');

  const streak = (s.streak && s.streak.count) || 0;
  const todayStudySecs = (s.studyTime && s.studyTime.seconds) || 0;
  const todayMins = Math.floor(todayStudySecs / 60);
  const overallPct = o.total > 0 ? Math.round((o.done / o.total) * 100) : 0;
  const notesCount = Object.keys(s.notes || {}).length;
  const greeting = getGreeting();

  const heading = basicsFirst
    ? 'Start with the core foundations'
    : nx
    ? (started ? `Next up: ${nx.title}` : `Your journey begins with ${nx.title.toLowerCase()}`)
    : 'Congratulations! All curriculum lessons are finished';

  const where = basicsFirst
    ? (nx.subject.id === 'english' ? 'Review foundation skills before starting Unit 1.' : 'Review foundation skills before diving into Chapter 1.')
    : nx
    ? `${nx.unit.title} • ${nx.label}`
    : 'Now proceed to full exam revisions and mock exams.';

  let countdown;
  if (ex && ex.days > 0) {
    const pace = remaining > 0 ? `Target: finish about ${((remaining / ex.days) * 7).toFixed(1)} lessons a week to be ready.` : 'All lessons are done. Focus on exam solving.';
    countdown = (
      <div className="countdown-box">
        <div className="cd-circle">
          <span className="num">{ex.days}</span>
          <span className="small">days left</span>
        </div>
        <div className="cd-details">
          <b style={{ fontSize: 15, display: 'block', color: 'var(--ink)' }}>Target Exam Date</b>
          <p className="small" style={{ marginTop: 4 }}>{pace}</p>
        </div>
      </div>
    );
  } else if (ex && ex.days === 0) {
    countdown = <p className="countdown"><b>Exam day!</b> Trust your preparation and do your best.</p>;
  } else if (ex) {
    countdown = <p className="countdown small">That date has passed. Pick your next exam date.</p>;
  } else {
    countdown = <p className="small" style={{ marginTop: 8 }}>Set your exam target date below to calculate your weekly pace.</p>;
  }

  return (
    <>
      {/* Daily Arabic motivation — first thing students see, once per day */}
      <DailyMotivation />

      {/* Hero Welcome Card */}
      <section className="hero">
        <div className="hero-top-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="greeting-badge">
              <Icon name="sparkles" size={14} />
              {greeting}, {started ? 'keep up the momentum' : 'welcome to your preparation'}
            </span>
            {streak > 0 && (
              <span className="streak-pill" title={`${streak} day study streak`}>
                <Icon name="flame" size={14} />{streak} day streak
              </span>
            )}
          </div>

          {nx && (
            <span className={`hero-tag c-${heroSubject.color}`}>
              <Icon name={heroSubject.icon} size={14} />{heroSubject.title}
            </span>
          )}
        </div>

        <h1 className="h1 hero-heading">{heading}</h1>
        <p className="where hero-where">{where}</p>

        <div className="hero-action-row">
          {basicsFirst ? (
            <a className="btn primary-action" href={`#/${nx.subject.id}`}>
              Start {nx.subject.title} Basics<Icon name="chev" size={16} stroke={2.6} />
            </a>
          ) : nx ? (
            <a className="btn primary-action" href={lessonHref(nx)}>
              {started ? 'Continue Lesson' : `Start ${nx.subject.title}`}<Icon name="chev" size={16} stroke={2.6} />
            </a>
          ) : (
            <a className="btn primary-action" href={`#/${ACTIVE[0].id}/revision`}>
              Go to Revision<Icon name="chev" size={16} stroke={2.6} />
            </a>
          )}

          {onOpenFormulas && (
            <button className="btn line" onClick={onOpenFormulas} title="Open Formula and Constants sheet">
              <Icon name="formula" size={16} />Formulas sheet<kbd className="inline-kbd">F</kbd>
            </button>
          )}
        </div>

        {/* Trail Route Overview */}
        <div className="trail-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <p className="trail-label">{heroSubject.title} Learning Trail</p>
            <span className="small">{subjectStats(s, heroSubject).done} of {subjectStats(s, heroSubject).total} lessons done</span>
          </div>
          <Trail subject={heroSubject} />
        </div>

        <div className="hero-stats-footer">
          <span><b>{o.done}</b> of {o.total} total lessons finished ({overallPct}%)</span>
          <span className="sep">•</span>
          <span><b>{o.rDone}</b> of {o.rTotal} revision items completed</span>
          {weak.length > 0 && (
            <>
              <span className="sep">•</span>
              <span style={{ color: 'var(--bad)' }}><b>{weak.length}</b> topics need review</span>
            </>
          )}
        </div>
      </section>

      {/* Sync CTA — only for confirmed signed-out students ('out', not the
          brief 'unknown' restore window) when cloud is configured */}
      {isCloudConfigured() && status === 'out' && (
        <section className="sync-cta" role="note" aria-label="Sync your progress">
          <span className="sync-cta-ic"><Icon name="cloud" size={22} /></span>
          <div className="sync-cta-text">
            <b>Sync your progress — free</b>
            <p className="small">Sign in so your streak, notes and checkmarks follow you to any device.</p>
          </div>
          <div className="row">
            <button className="btn sm" type="button" onClick={() => onSignIn && onSignIn('in')}>Sign in</button>
            <button className="btn line sm" type="button" onClick={() => onSignIn && onSignIn('up')}>Create account</button>
          </div>
        </section>
      )}

      {/* Modern High-Impact Metrics Grid */}
      <section className="metrics-bar" aria-label="Study Metrics">
        <div className="metric-card">
          <span className="metric-ic streak"><Icon name="flame" size={22} /></span>
          <div>
            <b className="metric-val"><CountUp value={streak} /> <span className="metric-unit">days</span></b>
            <span className="metric-lbl">Active Streak</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-ic timer"><Icon name="timer" size={22} /></span>
          <div>
            <b className="metric-val"><CountUp value={todayMins} /> <span className="metric-unit">mins</span></b>
            <span className="metric-lbl">Focused Today</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-ic target"><Icon name="target" size={22} /></span>
          <div>
            <b className="metric-val"><CountUp value={overallPct} />%</b>
            <span className="metric-lbl">{o.done} / {o.total} Lessons Done</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-ic notes"><Icon name="pencil" size={20} /></span>
          <div>
            <b className="metric-val"><CountUp value={notesCount} /></b>
            <span className="metric-lbl">Study Notes Saved</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="cols">
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h2 className="h2">My Subjects</h2>
            <span className="small">{ACTIVE.length} subjects active</span>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {ACTIVE.map((sub) => {
              const st = subjectStats(s, sub);
              const next = subjectNextStep(s, sub);
              const badgeCls = next.tone === 'done' ? 'tag ok' : next.tone === 'start' ? 'tag next' : next.tone === 'muted' ? 'tag opt' : 'tag';
              const chapterCount = sub.groups.reduce((acc, g) => acc + g.units.length, 0);
              const structureLabel = sub.structureDesc || `${chapterCount} chapters`;

              return (
                <a key={sub.id} className={`subj c-${sub.color}`} href={`#/${sub.id}`}>
                  <span className="ic"><Icon name={sub.icon} size={26} /></span>
                  <span className="grow">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <b className="h3" style={{ fontSize: 18 }}>{sub.title}</b>
                      <span className="small"><b className="num" style={{ fontSize: 20, color: 'var(--ink)' }}>{st.pct}%</b></span>
                    </div>
                    <span className="small" style={{ display: 'block', margin: '4px 0 8px' }}>
                      {sub.desc} • {structureLabel}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={badgeCls}>{next.label}</span>
                      <span className="small">{st.done}/{st.total} done</span>
                    </div>
                    <div className="bar" role="progressbar" aria-valuenow={st.pct} aria-valuemin={0} aria-valuemax={100}>
                      <i style={{ width: `${st.pct}%` }} />
                    </div>
                  </span>
                </a>
              );
            })}
          </div>

          {soon.length > 0 && (
            <div className="soon-section" style={{ marginTop: 16 }}>
              <p className="small" style={{ marginBottom: 8, fontWeight: 600 }}>Upcoming Subjects</p>
              {soon.map((sub) => (
                <div className="soonrow" key={sub.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name={sub.icon} size={17} />
                    <span>{sub.title}</span>
                  </div>
                  <span className="tag opt">Coming soon</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar Widgets (Exam & Weak Topics) */}
        <div style={{ display: 'grid', gap: 18, alignSelf: 'start' }}>
          <section className="box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span className="metric-ic timer" style={{ width: 34, height: 34, borderRadius: '50%' }}><Icon name="calc" size={17} /></span>
              <h2 className="h2" style={{ fontSize: 19, margin: 0 }}>Exam Target</h2>
            </div>
            <label className="small" htmlFor="exam">Set your target exam date:</label>
            <input className="date" type="date" id="exam" value={s.exam} onChange={(e) => setExam(e.target.value)} />
            {countdown}
          </section>

          {weak.length > 0 && (
            <section className="box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="metric-ic" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bad-tint)', color: 'var(--bad)' }}>
                  <Icon name="flag" size={16} />
                </span>
                <h2 className="h2" style={{ fontSize: 19, margin: 0 }}>Review Needed</h2>
              </div>
              <p className="small">Lessons you marked as weak. Revisit before exam day:</p>
              <div className="chips" style={{ marginTop: 12 }}>
                {weak.map((l) => (
                  <a key={l.id} href={lessonHref(l)} title={`${l.subject.title} - ${l.unit.title}`}>
                    {l.title}
                  </a>
                ))}
              </div>
            </section>
          )}

          <div className="storage-hint">
            <Icon name={status === 'in' ? 'cloud' : 'check'} size={15} />
            <span>{status === 'in'
              ? 'Progress is saved to your account and syncs automatically.'
              : isCloudConfigured()
                ? 'Sign in to save your progress and keep it on every device.'
                : 'Progress saves in this browser only — cloud sync is not set up.'}</span>
          </div>
        </div>
      </div>
    </>
  );
}
