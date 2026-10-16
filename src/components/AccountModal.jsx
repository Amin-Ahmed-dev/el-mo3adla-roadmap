import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { SITE } from '../config.js';
import { isCloudConfigured } from '../lib/supabase.js';
import { resetPassword, signIn, signOut, signUp, updatePassword, useSession } from '../store/session.js';
import { checkEmailDeliverable, emailVerdictMessage } from '../lib/emailCheck.js';
import { firstPasswordIssue, validatePassword } from '../lib/password.js';
import { cancelPendingPush, pushNowAsync } from '../lib/cloud.js';
import { getProgressState } from '../store/progress.js';
import { toast } from '../lib/toast.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Tabs that set a NEW password — the strong-password policy applies here.
// ('in' uses an existing password, 'reset' has no password field.)
const NEEDS_STRONG_PW = ['up', 'new'];

/**
 * Account modal — the single entry point for authentication:
 * sign-in / create account / forgot password / set-new-password (recovery
 * links). Signed-in students see their email, sync state and sign-out.
 * Backup codes and progress-reset were removed: Supabase auth + cloud sync
 * are the only supported way to move progress between devices.
 */
export default function AccountModal({ onClose, syncing, initialTab }) {
  const { status, user } = useSession();
  const [tab, setTab] = useState(['in', 'up', 'reset', 'new'].includes(initialTab) ? initialTab : 'in'); // 'in' | 'up' | 'reset' | 'new'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(false);
  // say() sets the inline form message with a tone: red by default, green for success.
  const say = (text, ok = false) => { setMsg(text); setMsgOk(ok); };
  // Tab switch clears secrets: never carry a typed password (or the visible
  // flag) from one auth form into the next.
  const goTab = (next) => { setTab(next); say(''); setPassword(''); setPw2(''); setShowPw(false); };

  // Rate-limit cooldown: after a 429 the submit button locks with a live
  // "Retry in Ns" label so the auth endpoint can't be hammered.
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy || cooldown > 0) return; // double-submit / rate-limit guard
    // Recovery-link landing: set the new password (session already established).
    if (tab === 'new') {
      const issue = firstPasswordIssue(password);
      if (issue) { say(issue); return; }
      if (password !== pw2) { say('Both passwords must match.'); return; }
      setBusy(true); say('');
      try {
        const res = await updatePassword(password);
        if (res.error) { say(res.error); if (res.rateLimited) setCooldown(60); return; }
        toast('Password updated. You are signed in.');
        onClose();
      } finally {
        setBusy(false);
      }
      return;
    }
    const em = email.trim().toLowerCase();
    if (!EMAIL_RE.test(em)) { say('Enter a valid email address.'); return; }
    // New passwords (sign-up + recovery) must meet the strong-password policy;
    // sign-in is exempt so existing students aren't locked out of old accounts.
    if (tab === 'up' || tab === 'new') {
      const issue = firstPasswordIssue(password);
      if (issue) { say(issue); return; }
    }
    setBusy(true); say('');
    try {
      // Sign-up pre-flight (client-side email check, works on every host): reject
      // undeliverable and throwaway addresses BEFORE Supabase creates the
      // account. Fail-open by design - if the lookup errors, sign-up proceeds
      // and the confirmation email stays the verification backstop.
      if (tab === 'up') {
        const blocked = emailVerdictMessage(await checkEmailDeliverable(em));
        if (blocked) { say(blocked); return; }
      }
      const res = tab === 'in' ? await signIn(em, password)
        : tab === 'up' ? await signUp(em, password)
        : await resetPassword(em);
      if (res.error) { say(res.error); if (res.rateLimited) setCooldown(60); return; }
      if (tab === 'reset') {
        say('Check your inbox for the reset link.', true);
        toast('Reset link sent.');
      } else if (tab === 'up') {
        if (res.needsConfirm) {
          say('Account created — check your inbox to confirm, then sign in.', true);
          toast('Check your inbox to confirm your email.');
          setTab('in');
        } else {
          say('Account created — you are signed in on this device.', true);
          toast('Account created. Progress will sync.');
        }
        setPassword(''); setPw2('');
      } else {
      toast('Signed in. Syncing progress…');
      onClose();
    }
    } finally {
      setBusy(false);
    }
  };

  const doSignOut = async () => {
    if (busy) return;
    setBusy(true);
    // Best-effort flush: push pending/local progress while the session is
    // still alive, so nothing unsynced is stranded on this device.
    try {
      cancelPendingPush();
      if (user?.id && isCloudConfigured()) await pushNowAsync(user.id, getProgressState);
    } catch { /* the per-account local cache keeps the data safe regardless */ }
    const res = await signOut();
    setBusy(false);
    if (res.error) { toast(res.error, 'err'); return; }
    toast('Signed out. Your progress is saved to your account.');
    onClose();
  };

  const field = {
    font: 'inherit', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid var(--line2)', background: 'var(--paper)', color: 'var(--ink)',
    width: '100%', boxSizing: 'border-box',
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Your account"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Your account">
        {!isCloudConfigured() ? (
          <>
            <h2 className="h2">Cloud sync is not set up yet</h2>
            <p className="small">This build has no Supabase keys, so progress stays in this browser only.</p>
            <div className="row"><button className="btn line sm" onClick={onClose}>Close</button></div>
          </>
        ) : status === 'in' && tab !== 'new' ? (
          <>
            <h2 className="h2">Your account</h2>
            <p className="small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="node done" style={{ width: 26, height: 26 }}>
                <Icon name="check" size={14} stroke={3} />
              </span>
              <b style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</b>
            </p>
            <p className="small">{syncing ? 'Syncing progress…' : 'Progress is synced to your account.'}</p>
            <div className="row">
              <button className="btn line sm" onClick={doSignOut} disabled={busy}>Sign out</button>
              <button className="btn line sm" onClick={onClose}>Close</button>
            </div>
          </>
        ) : (
          <>
            {/* Branded header — makes the modal feel like a dedicated auth page */}
            <div className="auth-brand">
              <span className="auth-logo"><Icon name="cap" size={26} /></span>
              <div>
                <b>{SITE.name}</b>
                <span>Your progress, everywhere</span>
              </div>
            </div>
            <div className="auth-perks" aria-label="Why sign in">
              <span><Icon name="check" size={13} />Sync across devices</span>
              <span><Icon name="shield" size={13} />Never lose your streak</span>
              <span><Icon name="sparkles" size={13} />Free forever</span>
            </div>
            <h2 className="h2">{tab === 'new' ? 'Set a new password' : tab === 'in' ? 'Welcome back' : tab === 'up' ? 'Create your account' : 'Reset password'}</h2>
            <p className="small">{tab === 'new' ? 'Your reset link worked — choose a new password to secure your account.' : 'Sign in to keep your progress synced across all your devices.'}</p>
            {tab !== 'new' && (
            <div className="tabs auth-tabs" role="tablist" aria-label="Account actions">
              <a href="#account-signin" role="tab" aria-selected={tab === 'in'}
                 aria-current={tab === 'in' ? 'page' : undefined}
                 onClick={(e) => { e.preventDefault(); goTab('in'); }}>Sign in</a>
              <a href="#account-signup" role="tab" aria-selected={tab === 'up'}
                 aria-current={tab === 'up' ? 'page' : undefined}
                 onClick={(e) => { e.preventDefault(); goTab('up'); }}>Create account</a>
            </div>
            )}
            <form onSubmit={submit} style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              {tab !== 'new' && (
                <>
                  <label className="small" htmlFor="acc-email">Email</label>
                  <input id="acc-email" type="email" autoComplete="email" autoFocus value={email}
                         onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={field} />
                </>
              )}
              {tab !== 'reset' && (
                <>
                  <label className="small" htmlFor="acc-pass">Password</label>
                  <div className="pw-wrap">
                    <input id="acc-pass" type={showPw ? 'text' : 'password'} value={password}
                           autoFocus={tab === 'new'}
                           autoComplete={tab === 'up' ? 'new-password' : 'current-password'}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder={NEEDS_STRONG_PW.includes(tab) ? 'Create a strong password' : 'Your password'} style={field} />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)}
                            aria-label={showPw ? 'Hide password' : 'Show password'}
                            title={showPw ? 'Hide password' : 'Show password'}>
                      <Icon name={showPw ? 'eyeOff' : 'eye'} size={17} />
                    </button>
                  </div>
                  {NEEDS_STRONG_PW.includes(tab) && (
                    <ul className="pw-rules" aria-label="Password requirements">
                      {validatePassword(password).checks.map((c) => (
                        <li key={c.key} className={c.ok ? 'ok' : ''}>
                          <span className="pw-bullet" aria-hidden="true">{c.ok ? '✓' : '•'}</span>
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  {tab === 'new' && (
                    <>
                      <label className="small" htmlFor="acc-pass2">Confirm new password</label>
                      <input id="acc-pass2" type={showPw ? 'text' : 'password'} value={pw2}
                             autoComplete="new-password" onChange={(e) => setPw2(e.target.value)}
                             placeholder="Repeat the password" style={field} />
                    </>
                  )}
                </>
              )}
              {msg && (
                <p className={`auth-msg ${msgOk ? 'ok' : 'err'}`} role="status">
                  {msgOk && <Icon name="check" size={15} stroke={2.6} />}
                  <span>{msg}</span>
                </p>
              )}
              <div className="row" style={{ margin: '4px 0 0' }}>
                <button className="btn sm" type="submit" disabled={busy || cooldown > 0} aria-busy={busy}>
                  {busy ? (
                    <>
                      <span className="btn-spin" aria-hidden="true" />
                      {tab === 'in' ? 'Signing in…' : tab === 'up' ? 'Creating account…' : tab === 'new' ? 'Saving…' : 'Sending link…'}
                    </>
                  ) : cooldown > 0 ? `Retry in ${cooldown}s`
                    : tab === 'in' ? 'Sign in' : tab === 'up' ? 'Create account' : tab === 'new' ? 'Save password' : 'Send reset link'}
                </button>
                <button className="btn line sm" type="button" onClick={onClose}>Cancel</button>
              </div>
            </form>
            {(tab === 'in' || tab === 'reset') && (
              <div className="row" style={{ marginTop: 4 }}>
                {tab === 'in'
                  ? <button className="btn line sm" type="button" onClick={() => goTab('reset')}>Forgot password?</button>
                  : <button className="btn line sm" type="button" onClick={() => goTab('in')}>Back to sign in</button>}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
