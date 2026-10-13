import { useState, useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { useProgress, addStudySeconds, toggleSound, playChime } from '../store/progress.js';

const MODES = [
  { id: 'pomo', label: 'Pomodoro', secs: 25 * 60 },
  { id: 'deep', label: 'Deep Focus', secs: 50 * 60 },
  { id: 'break', label: 'Short Break', secs: 5 * 60 },
  { id: 'stopwatch', label: 'Stopwatch', secs: 0 },
];

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function StudyDock({ onOpenFormulas }) {
  const s = useProgress();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('pomo');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [closingPop, setClosingPop] = useState(false);

  const timerRef = useRef(null);
  // The interval reads the current seconds from a ref so the state updater stays
  // pure: no store writes, audio or setState inside it. Side effects in an updater
  // run during React's render phase (a warning) and StrictMode would run them twice,
  // double-counting study time.
  const timeLeftRef = useRef(timeLeft);
  const todayStudySecs = s.studyTime && s.studyTime.seconds ? s.studyTime.seconds : 0;
  const todayMinutes = Math.floor(todayStudySecs / 60);
  const streakCount = (s.streak && s.streak.count) || 0;

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        const prev = timeLeftRef.current;
        if (mode === 'stopwatch') {
          timeLeftRef.current = prev + 1;
          setTimeLeft(timeLeftRef.current);
          addStudySeconds(1);
          return;
        }
        if (prev <= 1) {
          timeLeftRef.current = 0;
          setTimeLeft(0);
          setRunning(false);
          clearInterval(timerRef.current);
          playChime('lesson');
          return;
        }
        const next = prev - 1;
        timeLeftRef.current = next;
        setTimeLeft(next);
        // Log focus time toward today's study metrics if in study modes
        if (mode === 'pomo' || mode === 'deep') addStudySeconds(1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, mode]);

  // Keep the popover mounted ~180ms after close so CSS can fade it out first.
  useEffect(() => {
    if (!closingPop) return undefined;
    const t = setTimeout(() => { setOpen(false); setClosingPop(false); }, 180);
    return () => clearTimeout(t);
  }, [closingPop]);

  const togglePop = () => {
    if (closingPop) { setClosingPop(false); return; } // clicked mid-fade: cancel the close
    if (open) setClosingPop(true); else setOpen(true);
  };
  const closePop = () => { if (open && !closingPop) setClosingPop(true); };

  const selectMode = (m) => {
    setRunning(false);
    setMode(m.id);
    timeLeftRef.current = m.secs;
    setTimeLeft(m.secs);
  };

  const resetTimer = () => {
    setRunning(false);
    const m = MODES.find((x) => x.id === mode) || MODES[0];
    timeLeftRef.current = m.secs;
    setTimeLeft(m.secs);
  };

  return (
    <>
      {/* Floating Compact Dock */}
      <aside className="study-dock" aria-label="Student Study Tools">
        <div className="study-dock-pill">
          {streakCount > 0 && (
            <span className="dock-stat streak" title={`${streakCount} day study streak`}>
              <Icon name="flame" size={16} />
              <b>{streakCount}d</b>
            </span>
          )}

          <button
            className={`dock-btn timer-badge ${running ? 'active' : ''}`}
            onClick={togglePop}
            title="Open Focus Timer"
          >
            <Icon name={running ? 'pause' : 'timer'} size={15} />
            <span>{formatTime(timeLeft)}</span>
          </button>

          <button
            className="dock-btn"
            onClick={onOpenFormulas}
            title="Open Formulas & Constants Sheet"
          >
            <Icon name="formula" size={16} />
            <span className="hide-sm">Formulas</span>
          </button>

          <button
            className="dock-btn icon-only"
            onClick={toggleSound}
            title={s.sound ? 'Sound Effects Enabled (click to mute)' : 'Sound Effects Muted (click to enable)'}
            aria-label="Toggle sound"
          >
            <Icon name={s.sound ? 'volume' : 'mute'} size={15} />
          </button>
        </div>

        {/* Expanded Timer Card */}
        {open && (
          <div className={`study-popover${closingPop ? ' closing' : ''}`}>
            <div className="sp-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="sp-icon"><Icon name="timer" size={17} /></span>
                <b style={{ fontSize: 15 }}>Focus Study Timer</b>
              </div>
              <button className="ib sm" onClick={closePop} aria-label="Close timer">
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="sp-modes">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className={`sp-mode-btn ${mode === m.id ? 'active' : ''}`}
                  onClick={() => selectMode(m)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="sp-display">
              <span className="sp-digits">{formatTime(timeLeft)}</span>
              <span className="small" style={{ color: 'var(--muted)' }}>
                {mode === 'stopwatch' ? 'Elapsed time' : running ? 'Stay focused on your current lesson' : 'Ready to start'}
              </span>
            </div>

            <div className="sp-controls">
              <button
                className={`btn sm ${running ? 'line' : ''}`}
                onClick={() => setRunning(!running)}
                style={{ flex: 1 }}
              >
                <Icon name={running ? 'pause' : 'play'} size={15} />
                {running ? 'Pause' : 'Start Focus'}
              </button>
              <button className="btn sm line" onClick={resetTimer} title="Reset timer">
                <Icon name="refresh" size={14} />
              </button>
            </div>

            <div className="sp-footer">
              <span>⏱️ <b>{todayMinutes}m</b> studied today</span>
              {streakCount > 0 && <span>🔥 <b>{streakCount}</b> day streak</span>}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
