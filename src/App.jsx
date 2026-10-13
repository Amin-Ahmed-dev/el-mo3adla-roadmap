import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './components/Icon.jsx';
import RouteSplash from './components/RouteSplash.jsx';
import Sidebar from './components/Sidebar.jsx';
import SearchModal from './components/SearchModal.jsx';
import AccountModal from './components/AccountModal.jsx';
import FormulaModal from './components/FormulaModal.jsx';
import StudyDock from './components/StudyDock.jsx';
import ToastHost from './components/ToastHost.jsx';
import Home from './pages/Home.jsx';
import SubjectPage from './pages/SubjectPage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import RevisionPage from './pages/RevisionPage.jsx';
import NotFound from './pages/NotFound.jsx';
import { SITE } from './config.js';
import { ACTIVE } from './data/catalog.js';
import { splashKeyFor } from './lib/splash.js';
import { clearAuthHash, consumeAuthLink, friendlyLinkError } from './lib/authLink.js';
import { getSupabaseAsync, isCloudConfigured } from './lib/supabase.js';
import { toast } from './lib/toast.js';
import { useCloudSync } from './lib/useCloudSync.js';
import { setStudyGate, useProgress } from './store/progress.js';
import { useRoute } from './lib/route.js';

function titleFor(route) {
  if (route.name === 'lesson') return `${route.lesson.title}, ${route.subject.title} | ${SITE.name}`;
  if (route.name === 'subject') return `${route.subject.title} | ${SITE.name}`;
  if (route.name === 'revision') return `Revision, ${route.subject.title} | ${SITE.name}`;
  return `${SITE.name} | ${SITE.tagline}`;
}

export default function App() {
  const route = useRoute();
  const { theme } = useProgress();
  const { syncing, status } = useCloudSync();
  const [navOpen, setNavOpen] = useState(false);
  const [modal, setModal] = useState(null); // 'search' | 'save' | 'formula' | null
  const [modalTab, setModalTab] = useState('in'); // which auth tab the account modal opens on
  const [closing, setClosing] = useState(false);
  // Tracks the open modal for the sign-in nudge below. The gate's onBlocked
  // closure is installed once per session status, so it would otherwise see a
  // stale `modal` value and keep reopening the form while it is already open
  // (the "loop" students reported). The ref always holds the current value.
  const modalRef = useRef(modal);
  modalRef.current = modal;

  // Branded route splash: plays on boot and whenever the *subject* changes.
  // The splash reveals the page underneath at fade start, so the page's rise
  // entrance plays visibly through the fade instead of after a blank gap.
  const key = splashKeyFor(route);
  const [splash, setSplash] = useState(() => ({ key, subject: route.subject || null }));
  const [pageVisible, setPageVisible] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  const prevKeyRef = useRef(key);
  if (prevKeyRef.current !== key) {
    // Render-phase update (guarded): swap the splash identity the moment the
    // subject key changes so the new branded loader paints immediately.
    prevKeyRef.current = key;
    setSplash({ key, subject: route.subject || null });
    if (pageVisible) setPageVisible(false);
    if (splashGone) setSplashGone(false);
  }
  const handleReveal = useCallback(() => setPageVisible(true), []);
  const handleSplashDone = useCallback(() => setSplashGone(true), []);

  // Remove the static boot placeholder (painted before React hydrates) once the
  // app mounts — the branded RouteSplash above already covers the screen.
  useEffect(() => { document.getElementById('boot-splash')?.remove(); }, []);

  // Keep a closing modal mounted ~200ms and flag body.is-closing so CSS can fade
  // the backdrop + sheet out smoothly before React removes them (no deps, no markup change).
  const closeModal = () => { if (modal && !closing) setClosing(true); };
  // Open the account modal on a given auth tab ('in' | 'up' | 'reset' | 'new').
  const openAccount = (tab = 'in') => { setModalTab(tab); setClosing(false); setModal('save'); };

  // Sign-in gate: while signed out, study-progress actions (steps, completing
  // lessons, revision, notes, extras, exam date) are no-ops — the store calls
  // back here (throttled to one nudge per few seconds) to show a toast + the
  // sign-in form. Browsing, the formula sheet, the focus timer (time just
  // doesn't save) and device preferences (theme/sound) stay free.
  // The modalRef guard stops the "loop": if the form is already open, a
  // further blocked action (e.g. a click behind the backdrop) must not
  // re-toast and reset the tab the student is typing in.
  useEffect(() => {
    setStudyGate({
      // Only gate when accounts actually exist: a build without Supabase keys
      // can never sign anyone in (status stays 'unknown'), so gating there
      // would freeze every study action. Offline/local mode must keep working.
      enabled: isCloudConfigured() && status !== 'in',
      onBlocked: () => {
        if (modalRef.current === 'save') return;
        toast('Sign in to save your progress.', 'err');
        openAccount('in');
      },
    });
    return () => setStudyGate({ enabled: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Supabase email links (recovery / confirmation) land on the app with auth
  // params in the hash (#access_token=...&type=recovery). Read the link once,
  // let the client consume the token, strip the params so the router sees a
  // normal route again, then open the UI that matches what the link meant.
  useEffect(() => {
    const link = consumeAuthLink();
    if (!link) return undefined;
    let alive = true;
    (async () => {
      try {
        const sb = await getSupabaseAsync();
        // detectSessionInUrl parses the auth hash asynchronously AFTER the
        // client is created — stripping the hash too early would destroy the
        // recovery session before the SDK ever sees it. Wait for the SDK's
        // boot event, with a timeout so a dead link can't hang the UI.
        if (sb && alive && (link.hasToken || link.hasCode)) {
          await new Promise((resolve) => {
            let sub = null;
            const done = () => { clearTimeout(timer); sub?.unsubscribe?.(); resolve(); };
            const timer = setTimeout(done, 2000);
            try {
              sub = sb.auth.onAuthStateChange((event) => {
                if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') done();
              }).data?.subscription;
            } catch { done(); }
          });
        }
      } catch { /* strip + toast still work offline */ }
      if (!alive) return;
      clearAuthHash();
      if (link.error || link.errorDescription) {
        toast(friendlyLinkError(link.errorDescription) || 'This link is invalid or has expired. Request a new one.', 'err');
      } else if (link.type === 'recovery') {
        openAccount('new');
      } else if (link.type) {
        toast('Email confirmed — you are signed in.');
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    document.body.classList.toggle('is-closing', closing);
    if (!closing) return undefined;
    const t = setTimeout(() => { setModal(null); setClosing(false); }, 200);
    return () => clearTimeout(t);
  }, [closing]);

  // theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.setAttribute('data-theme', theme); else root.removeAttribute('data-theme');
  }, [theme]);

  // mobile drawer (the CSS keys off body.open)
  useEffect(() => { document.body.classList.toggle('open', navOpen); }, [navOpen]);

  // new page: back to top, close the drawer, update the tab title, old #/revision link
  useEffect(() => {
    if (route.name === 'legacy-revision') { window.location.replace(`#/${ACTIVE[0].id}/revision`); return; }
    window.scrollTo(0, 0);
    setNavOpen(false);
    document.title = titleFor(route);
  }, [route.hash]); // eslint-disable-line react-hooks/exhaustive-deps

  // keyboard: "/" or Ctrl+K opens search, "F" opens formulas, Esc closes
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(input|textarea|select)$/i.test((e.target && e.target.tagName) || '');
      if (e.key === 'Escape') { closeModal(); setNavOpen(false); return; }
      if (modal) return;
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault(); setModal('search');
      } else if (e.key.toLowerCase() === 'f' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault(); setModal('formula');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, closing]);

  let page;
  const showPage = pageVisible;
  switch (route.name) {
    case 'home': page = showPage ? <Home onOpenFormulas={() => setModal('formula')} onSignIn={openAccount} /> : null; break;
    case 'subject': page = showPage ? <SubjectPage subject={route.subject} onOpenFormulas={() => setModal('formula')} /> : null; break;
    case 'lesson': page = showPage ? <LessonPage key={route.lesson.id} lesson={route.lesson} onOpenFormulas={() => setModal('formula')} /> : null; break;
    case 'revision': page = showPage ? <RevisionPage subject={route.subject} /> : null; break;
    case 'legacy-revision': page = null; break;
    default: page = showPage ? <NotFound /> : null;
  }

  return (
    <>
      <div className="shell">
        <Sidebar
          route={route}
          syncing={syncing}
          onSearch={() => { setNavOpen(false); setModal('search'); }}
          onSave={() => { setNavOpen(false); openAccount('in'); }}
          onFormulas={() => { setNavOpen(false); setModal('formula'); }}
        />
        <div>
          <div className="topbar">
            <button className="ib" onClick={() => setNavOpen(!navOpen)} aria-label="Open menu"><Icon name="menu" size={22} /></button>
            <b>{SITE.name}</b>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="ib" onClick={() => openAccount('in')} aria-label="Account"><Icon name="user" size={20} /></button>
              <button className="ib" onClick={() => setModal('formula')} title="Formulas & Reference (F)"><Icon name="formula" size={20} /></button>
              <button className="ib" onClick={() => setModal('search')} aria-label="Search"><Icon name="search" size={21} /></button>
            </div>
          </div>
          <main className="main" id="app">{page}</main>
        </div>
      </div>
      <div className="scrim" onClick={() => setNavOpen(false)} />

      {/* Floating study dock with focus timer, streak, sound & formula sheet */}
      <StudyDock onOpenFormulas={() => setModal('formula')} />

      {/* Transient confirmations (copy/save/reset) */}
      <ToastHost />

      {modal === 'search' && <SearchModal onClose={closeModal} />}
      {modal === 'save' && <AccountModal onClose={closeModal} syncing={syncing} initialTab={modalTab} />}
      {modal === 'formula' && <FormulaModal onClose={closeModal} />}

      {!splashGone && (
        <RouteSplash
          key={splash.key}
          subject={splash.subject}
          onReveal={handleReveal}
          onDone={handleSplashDone}
        />
      )}
    </>
  );
}
