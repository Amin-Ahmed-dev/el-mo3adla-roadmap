import { useEffect, useState } from 'react';
import { subscribeToasts } from '../lib/toast.js';

/**
 * Renders transient confirmations. Each toast slides in (compositor), holds
 * ~2.4s, fades out over 220ms, then unmounts — same delayed-unmount pattern
 * used by the modals so exits always animate.
 */
export default function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const timers = new Map();
    const unsub = subscribeToasts((t) => {
      setItems((prev) => [...prev.slice(-2), t]); // keep at most 3
      const t1 = setTimeout(() => {
        setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, out: true } : x)));
        const t2 = setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 220);
        timers.set(t.id, (timers.get(t.id) || []).concat(t2));
      }, 2400);
      timers.set(t.id, [t1]);
    });
    return () => {
      unsub();
      timers.forEach((list) => list.forEach(clearTimeout));
    };
  }, []);

  if (!items.length) return null;
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast t-${t.tone}${t.out ? ' out' : ''}`}>{t.message}</div>
      ))}
    </div>
  );
}