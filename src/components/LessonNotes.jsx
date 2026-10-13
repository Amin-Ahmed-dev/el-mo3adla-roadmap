import { useState, useEffect } from 'react';
import Icon from './Icon.jsx';
import { useProgress, setLessonNote } from '../store/progress.js';
import { toast } from '../lib/toast.js';

export default function LessonNotes({ lessonId, lessonTitle }) {
  const s = useProgress();
  const savedNote = (s.notes && s.notes[lessonId]) || '';
  const [text, setText] = useState(savedNote);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!!savedNote);
  const [closing, setClosing] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Keep the panel mounted ~180ms after collapse so CSS can fade it out first.
  useEffect(() => {
    if (!closing) return undefined;
    const t = setTimeout(() => { setExpanded(false); setClosing(false); setAnimating(false); }, 180);
    return () => clearTimeout(t);
  }, [closing]);

  // Open: show briefly and let CSS fade/slide it in instead of appearing instantly.
  const toggleExpanded = () => {
    if (closing) { setClosing(false); return; } // clicked mid-fade: cancel the close
    if (expanded) setClosing(true);
    else { setAnimating(true); setExpanded(true); }
  };

  // Sync if store changes externally
  useEffect(() => {
    setText(savedNote);
  }, [savedNote]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    setLessonNote(lessonId, val);
  };

  const copyNotes = () => {
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast('Notes copied to clipboard.');
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <section className="student-notes-section">
      <div
        className="sn-header-bar"
        onClick={toggleExpanded}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="sn-circle-icon">
            <Icon name="pencil" size={17} />
          </span>
          <div>
            <h2 className="h3" style={{ fontSize: 16, margin: 0, color: 'var(--ink)' }}>
              Lesson Notes & Key Takeaways
            </h2>
            <span className="small" style={{ fontSize: 12.5 }}>
              {text.trim() ? `${text.trim().length} characters saved` : 'Jot down personal formulas, key tricks & exam reminders'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {text.trim() && (
            <span className="tag ok" style={{ fontSize: 12 }}>
              <Icon name="check" size={12} /> Auto-saved
            </span>
          )}
          <span
            className="sn-toggle-chevron"
            style={{ transform: expanded && !closing ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <Icon name="chev" size={15} stroke={2.6} />
          </span>
        </div>
      </div>

      {expanded && (
        <div
          className={`sn-content${closing ? ' closing' : ''}`}
          style={{ animation: animating ? 'fadeInUp .35s var(--ease) both' : 'fadeIn .3s var(--ease) backwards' }}
        >
          <textarea
            className="sn-journal-textarea"
            placeholder={`Jot down formulas to remember, video timestamps, or key notes for "${lessonTitle}"...`}
            value={text}
            onChange={handleChange}
            rows={4}
          />
          <div className="sn-footer-bar">
            <span className="small" style={{ fontSize: 12 }}>
              Saved automatically in this browser.
            </span>
            {text.trim() && (
              <button
                type="button"
                className="btn sm line sn-copy-btn"
                onClick={copyNotes}
                title="Copy notes to clipboard"
              >
                <Icon name={copied ? 'check' : 'copy'} size={13} />
                <span>{copied ? 'Copied' : 'Copy Notes'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
