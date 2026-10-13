import { useEffect, useState } from 'react';
import { motivationForDate, motivationIndexFor, msUntilMidnight, todayKey } from '../data/motivation.js';
import Icon from './Icon.jsx';

const CACHE_KEY = 'mo3adla-motivation-v2';

/**
 * Daily Arabic motivation — fully automatic, premium edition.
 * - One phrase per calendar day (deterministic): every student sees the same
 *   phrase on the same day, on every device. ZERO student action required.
 * - Rolls over on its own at local midnight (timer + cross-tab storage tick).
 * - RTL Arabic card, gradient art, keyed remount fade/slide on day change.
 * - Same-day cache only: a reopen never flashes yesterday's phrase.
 */
export default function DailyMotivation() {
  const [renderKey, setRenderKey] = useState(() => todayKey());

  // Today's phrase: prefer the same-day cache, else compute from the date.
  const idx = motivationIndexFor();
  let phrase = motivationForDate();
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.day === todayKey() && MOTIVATION_POOL[cached.idx]) {
      phrase = MOTIVATION_POOL[cached.idx];
    }
  } catch { /* corrupted cache → fall through to the computed phrase */ }

  useEffect(() => {
    // Persist today's pick so a refresh shows the same phrase instantly.
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ day: todayKey(), idx: motivationIndexFor() }));
    } catch { /* private mode — card still works, just uncached */ }

    // Auto-rollover at local midnight: re-key → CSS entrance replays.
    const t = setTimeout(() => setRenderKey(todayKey()), msUntilMidnight());

    // Cross-tab sync: if another tab rolled over first, follow it.
    const onStorage = (e) => {
      if (e.key === CACHE_KEY) setRenderKey(todayKey());
    };
    window.addEventListener('storage', onStorage);
    // Also re-check when the tab regains focus (laptop slept past midnight).
    const onFocus = () => setRenderKey(todayKey());
    window.addEventListener('focus', onFocus);
    return () => {
      clearTimeout(t);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, [renderKey]);

  return (
    <section key={renderKey} className="dm-card" dir="rtl" lang="ar" aria-label="عبارة اليوم التحفيزية">
      <span className="dm-glow" aria-hidden="true" />
      <span className="dm-badge" aria-hidden="true">
        <Icon name="sparkles" size={20} />
      </span>
      <div className="dm-body">
        <p className="dm-kicker">
          <Icon name="flame" size={13} />
          <span>عبارة اليوم</span>
        </p>
        <p className="dm-title">{phrase.t}</p>
        <p className="dm-sub">{phrase.b}</p>
      </div>
    </section>
  );
}
