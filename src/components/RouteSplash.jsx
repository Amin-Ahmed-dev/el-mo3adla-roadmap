import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { SITE } from '../config.js';
import { SPLASH_FADE_MS, SPLASH_SHOW_MS, motifFor, shouldSkipSplash } from '../lib/splash.js';

/**
 * Branded route-transition splash.
 *
 * Each subject gets its own identity: subject-colored logo badge + a motif
 * that expresses the subject (floating math glyphs / orbiting electrons /
 * typing lines), plus the subject title, tagline and a progress shimmer.
 * Home and unknown routes fall back to the app brand.
 *
 * The splash stays fully visible for SPLASH_SHOW_MS, then gets a `leaving`
 * class so CSS fades it out over SPLASH_FADE_MS before `onDone` unmounts it.
 * Under prefers-reduced-motion `onDone` fires immediately with no splash.
 */
export default function RouteSplash({ subject, onReveal, onDone }) {
  const [leaving, setLeaving] = useState(false);
  const motif = motifFor(subject && subject.icon);
  const color = (subject && subject.color) || 'blue';
  const title = subject ? subject.title : SITE.name;
  const tag = subject ? subject.desc : SITE.tagline;
  const icon = (subject && subject.icon) || 'cap';

  useEffect(() => {
    if (shouldSkipSplash()) { onReveal(); onDone(); return undefined; }
    const t1 = setTimeout(() => {
      setLeaving(true);
      onReveal(); // mount the page underneath so its rise entrance plays during the fade
    }, SPLASH_SHOW_MS);
    const t2 = setTimeout(onDone, SPLASH_SHOW_MS + SPLASH_FADE_MS + 30);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone, onReveal]);

  return (
    <div
      className={`splash c-${color}${leaving ? ' leaving' : ''}`}
      role="status"
      aria-label={`Loading ${title}`}
    >
      <span className="sr">Loading {title}…</span>
      <div className="splash-inner" aria-hidden="true">
        <div className="splash-orb" />
        <div className="splash-visual">
          {motif === 'math' && (
            <div className="splash-glyphs">
              {['π', '∑', '√', '∞', '∆'].map((g) => <span key={g}>{g}</span>)}
            </div>
          )}
          {motif === 'orbit' && (
            <div className="splash-orbit">
              <i className="o1" /><i className="o2" /><i className="o3" /><b className="nuc" />
            </div>
          )}
          {motif === 'type' && (
            <div className="splash-lines">
              <i /><i /><i /><i />
            </div>
          )}
          <div className="splash-badge">
            <Icon name={icon} size={44} stroke={1.9} />
          </div>
        </div>
        <p className="splash-kicker">{subject ? 'Loading subject' : 'Welcome back'}</p>
        <p className="splash-title">{title}</p>
        <p className="splash-tag">{tag}</p>
        <div className="splash-bar"><i /></div>
      </div>
    </div>
  );
}
