import { useEffect, useRef, useState } from 'react';
import { loadState, saveState } from './game/storage';
import { confirmUnlock, getPhase, getWeaponPhase, hit, initialState, pendingUnlock, type GameState, type Language } from './game/gameLogic';
import { IMPACT_MS } from './game/constants';
import { preloadSprites } from './game/sprites';
import { translations } from './i18n';
import { getPhrase } from './i18n/phrases';
import { CreatorCredit } from './components/CreatorCredit';
import { Backdrop } from './components/Backdrop';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { LanguageSelector } from './components/LanguageSelector';
import { WeaponCursor } from './components/WeaponCursor';
import { UnlockDialog } from './components/UnlockDialog';
import { EndingScreen } from './components/EndingScreen';
import type { Impact } from './components/PChan';
export default function App() {
  const [state, setState] = useState(loadState);
  const current = useRef(state);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [impact, setImpact] = useState<Impact | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sequence = useRef(0);
  const t = translations[state.language];
  const phase = getPhase(state.clicks);
  const weaponPhase = getWeaponPhase(state.clicks);
  const pending = pendingUnlock(state);
  function commit(next: GameState) { current.current = next; saveState(next); setState(next); }
  useEffect(() => {
    let live = true;
    preloadSprites().then(() => { if (live) setReady(true); }).catch(() => { if (live) setError(true); });
    return () => { live = false; clearTimeout(timer.current); };
  }, []);
  useEffect(() => { document.documentElement.lang = state.language; document.documentElement.style.backgroundColor = state.completed ? '#000000' : '#fce9f3'; }, [state.language, state.completed]);
  function onHit(x: number, y: number, touch: boolean) {
    if (!ready) return;
    const next = hit(current.current);
    if (next === current.current) return;
    clearTimeout(timer.current);
    commit(next);
    if (next.completed) { setImpact(null); return; }
    setImpact({ id: ++sequence.current, x, y, touch });
    timer.current = setTimeout(() => setImpact(null), IMPACT_MS);
  }
  function replay() { clearTimeout(timer.current); setImpact(null); commit({ ...initialState, language: current.current.language, playerName: current.current.playerName }); }
  function language(l: Language) { commit({ ...current.current, language: l }); }
  if (state.completed || phase === 4) return <div className="ending-layout" lang={state.language}><EndingScreen text={t.ending.replaceAll('{name}', () => state.playerName)} replay={t.replay} continueLabel={t.continue} threat={t.endingThreat} credit={t.createdBy} onReplay={replay} /></div>;
  const playing = state.started && !!state.playerName.trim();
  return <div className={`app ${playing && !pending && ready ? 'playing' : ''}`} lang={state.language}><Backdrop /><LanguageSelector language={state.language} label={t.language} onChange={language} />{playing ? <GameScreen t={t} phase={phase} weaponPhase={weaponPhase} clicks={state.clicks} speech={getPhrase(state.clicks, state.language, state.playerName)} impact={impact} disabled={!!pending || !ready} onHit={onHit} /> : <StartScreen t={t} ready={ready} error={error} playerName={state.playerName} onStart={name => commit({ ...current.current, playerName: name, started: true })} />}{playing && !ready && <p className="loading-status" role="status">{error ? t.error : t.loading}</p>}{playing && <WeaponCursor phase={weaponPhase} impact={impact} active={!pending && ready} />}<CreatorCredit label={t.createdBy} />{pending && <UnlockDialog unlock={pending} t={t} onContinue={() => commit(confirmUnlock(current.current))} />}</div>;
}
