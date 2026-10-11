import { GAME_CONFIG as C } from './constants';
export type Language = 'es' | 'en' | 'ja';
export type Unlock = 'hammer' | 'knife';
export interface GameState { version: 1; clicks: number; language: Language; playerName: string; started: boolean; hammerConfirmed: boolean; knifeConfirmed: boolean; completed: boolean }
export const initialState: GameState = { version: 1, clicks: 0, language: 'es', playerName: '', started: false, hammerConfirmed: false, knifeConfirmed: false, completed: false };
export function getPhase(clicks: number): 1 | 2 | 3 | 4 { return clicks >= C.ENDING ? 4 : clicks >= C.PHASE_03_START ? 3 : clicks >= C.PHASE_02_START ? 2 : 1; }
export function getWeaponPhase(clicks: number): 1 | 2 | 3 { return clicks >= C.KNIFE_UNLOCK ? 3 : clicks >= C.HAMMER_UNLOCK ? 2 : 1; }
export function pendingUnlock(s: GameState): Unlock | null {
  if (!s.started || s.completed) return null;
  if (s.clicks >= C.HAMMER_UNLOCK && !s.hammerConfirmed) return 'hammer';
  if (s.clicks >= C.KNIFE_UNLOCK && !s.knifeConfirmed) return 'knife';
  return null;
}
export function hit(s: GameState): GameState {
  if (!s.started || !s.playerName.trim() || s.completed || pendingUnlock(s)) return s;
  const clicks = Math.min(C.ENDING, s.clicks + 1);
  return { ...s, clicks, completed: clicks === C.ENDING };
}
export function confirmUnlock(s: GameState): GameState {
  const pending = pendingUnlock(s);
  return pending ? { ...s, [pending === 'hammer' ? 'hammerConfirmed' : 'knifeConfirmed']: true } : s;
}
export function restoreState(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object' || !('version' in raw) || raw.version !== 1) return { ...initialState };
  const s = raw as Partial<GameState>;
  const clicks = typeof s.clicks === 'number' && Number.isFinite(s.clicks) ? Math.max(0, Math.min(C.ENDING, Math.floor(s.clicks))) : 0;
  const completed = clicks === C.ENDING || s.completed === true;
  return { version: 1, playerName: typeof s.playerName === 'string' ? s.playerName.trim().slice(0, 24) : '', clicks: completed ? C.ENDING : clicks, language: s.language === 'en' || s.language === 'ja' ? s.language : 'es', started: s.started === true || clicks > 0 || completed, hammerConfirmed: s.hammerConfirmed === true && clicks >= C.HAMMER_UNLOCK, knifeConfirmed: s.knifeConfirmed === true && clicks >= C.KNIFE_UNLOCK, completed };
}

// Only an explicitly completed ending can be resumed after reloading.
export function restoreSessionState(raw: unknown): GameState {
  const s = restoreState(raw);
  const completed = !!raw && typeof raw === 'object' && 'completed' in raw && raw.completed === true;
  return completed ? s : { ...initialState, language: s.language, playerName: s.playerName };
}
