import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { search } from '../lib/search.js';

export default function SearchModal({ onClose }) {
  const [q, setQ] = useState('');
  const [act, setAct] = useState(0);
  const input = useRef(null);
  useEffect(() => { input.current && input.current.focus(); }, []);
  const results = search(q);

  const onKey = (e) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setAct((act + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAct((act - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { e.preventDefault(); window.location.hash = results[act].href; onClose(); }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Search"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <input ref={input} type="search" value={q} placeholder="Search lessons, videos, PDFs, revision"
               autoComplete="off" aria-label="Search" onChange={(e) => { setQ(e.target.value); setAct(0); }} onKeyDown={onKey} />
        <ul className="results">
          {!q.trim() && <li className="small" style={{ padding: 12 }}>Type a lesson name, a video title or a topic.</li>}
          {q.trim() && results.length === 0 && <li className="small" style={{ padding: 12 }}>Nothing matches “{q.trim()}”. Try a shorter word.</li>}
          {results.map((x, i) => (
            <li key={x.href + x.title + i}>
              <a href={x.href} className={i === act ? 'act' : ''} onClick={onClose}>
                <span style={{ color: 'var(--brand)' }}><Icon name={x.icon} size={18} /></span>
                <span className="grow"><b>{x.title}</b><span className="small">{x.meta}</span></span>
                <span className="tag rec">{x.type}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
