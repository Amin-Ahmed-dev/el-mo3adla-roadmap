import { Fragment } from 'react';
import Icon from './Icon.jsx';
import AuthorCredit from './AuthorCredit.jsx';
import { SITE } from '../config.js';
import { SUBJECTS } from '../data/catalog.js';
import { setTheme, useProgress } from '../store/progress.js';
import { useSession } from '../store/session.js';
import { isCloudConfigured } from '../lib/supabase.js';
import { effectiveTheme, revisionStats, subjectStats } from '../lib/selectors.js';

export default function Sidebar({ route, onSearch, onSave, onFormulas, syncing }) {
  const s = useProgress();
  const { status, user } = useSession();
  // While the stored session is still restoring ('unknown'), don't flash
  // "Sign in" at returning students — show a neutral "Account" label instead.
  const restoring = status === 'unknown' && isCloudConfigured();
  const dark = effectiveTheme(s.theme) === 'dark';
  const current = route.subject && route.subject.id;
  const streak = (s.streak && s.streak.count) || 0;
  const signedIn = status === 'in';

  return (
    <aside className="side" id="side" aria-label="Main navigation">
      <div className="brand">
        <span className="brand-mark" style={{ color: '#fff' }}><Icon name="cap" size={22} /></span>
        <div><b>{SITE.name}</b><span>{SITE.tagline}</span></div>
      </div>

      <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
        <button className="search-btn" onClick={onSearch}>
          <Icon name="search" size={17} /><span>Search</span><kbd>/</kbd>
        </button>
        <button className="search-btn" onClick={onFormulas} style={{ marginBottom: 0 }}>
          <Icon name="formula" size={17} /><span>Formulas</span><kbd>F</kbd>
        </button>
      </div>

      <nav className="nav" aria-label="Sections">
        <a href="#/" aria-current={route.name === 'home' ? 'page' : undefined}>
          <Icon name="home" size={19} />
          <span>Home</span>
          {streak > 0 && (
            <span className="sidebar-streak-badge" title={`${streak} day study streak`}>
              <Icon name="flame" size={13} />{streak}d
            </span>
          )}
        </a>

        <p className="grp">Subjects</p>
        {SUBJECTS.map((sub) => {
          if (sub.status !== 'active') {
            return <span className="soon" key={sub.id}><Icon name={sub.icon} size={19} />{sub.title}<i>Soon</i></span>;
          }
          const st = subjectStats(s, sub), rv = revisionStats(s, sub), here = current === sub.id;
          return (
            <Fragment key={sub.id}>
              <a href={`#/${sub.id}`} aria-current={here && route.name !== 'revision' ? 'page' : undefined}>
                <Icon name={sub.icon} size={19} />{sub.title}<span className="mini">{st.done}/{st.total}</span>
              </a>
              {here && rv.total > 0 && (
                <a className="sub" href={`#/${sub.id}/revision`} aria-current={route.name === 'revision' ? 'page' : undefined}>
                  Revision<span className="mini">{rv.done}/{rv.total}</span>
                </a>
              )}
            </Fragment>
          );
        })}
      </nav>

      <div className="side-foot">
        <button onClick={onSave} title={signedIn ? user?.email || 'Your account' : 'Sign in to sync your progress'}>
          <Icon name={signedIn ? 'user' : 'save'} size={18} />
          {signedIn ? (syncing ? 'Syncing…' : 'Account') : restoring ? 'Account' : 'Sign in'}
        </button>
        <button onClick={() => setTheme(dark ? 'light' : 'dark')}>
          <Icon name={dark ? 'sun' : 'moon'} size={18} />{dark ? 'Light mode' : 'Dark mode'}
        </button>
        <AuthorCredit variant="sidebar" />
      </div>
    </aside>
  );
}
