import { initialState, restoreSessionState, type GameState } from './gameLogic';
import { STORAGE_KEY } from './constants';
export function loadState(): GameState {
  try { const state = restoreSessionState(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')); saveState(state); return state; } catch { return { ...initialState }; }
}
export function saveState(s: GameState) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s.completed ? s : { ...initialState, language: s.language, playerName: s.playerName })); } catch { /* The game remains playable if browser storage is unavailable. */ } }
