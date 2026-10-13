/* Tiny toast bus — no dependencies, no timers here (the host owns them).
   Components call toast('message') and the <ToastHost/> renders the stack. */
let listeners = [];
let seq = 0;

export function toast(message, tone = 'ok') {
  if (!message) return;
  const item = { id: ++seq, message, tone };
  listeners.forEach((fn) => fn(item));
}

export function subscribeToasts(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter((x) => x !== fn); };
}