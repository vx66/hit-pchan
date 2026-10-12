import { describe, expect, it } from 'vitest';
import { confirmUnlock, getPhase, getWeaponPhase, restoreSessionState, hit, initialState, pendingUnlock, restoreState } from '../src/game/gameLogic';
import { getPhrase, phrases } from '../src/i18n/phrases';
import { translations } from '../src/i18n';
import { ENDING_CONFIG } from '../src/game/constants';
import { existsSync, readFileSync } from 'node:fs';
describe('phase boundaries', () => {
  it.each([[0,1],[499,1],[500,1],[549,1],[550,2],[999,2],[1000,2],[1049,2],[1050,3],[1499,3],[1500,4]])('%i hits -> phase %i', (clicks, phase) => expect(getPhase(clicks)).toBe(phase));
});
describe('progression', () => {
  it('blocks immediately on unlock and only continues after confirmation', () => {
    let s = { ...initialState, playerName: 'Ame', started: true };
    for (let i = 0; i < 500; i++) s = hit(s);
    expect(pendingUnlock(s)).toBe('hammer'); expect(hit(s)).toBe(s);
    s = confirmUnlock(s); expect(pendingUnlock(s)).toBeNull();
    for (let i = 0; i < 500; i++) s = hit(s);
    expect(s.clicks).toBe(1000); expect(pendingUnlock(s)).toBe('knife'); expect(hit(s)).toBe(s);
    s = confirmUnlock(s);
    for (let i = 0; i < 500; i++) s = hit(s);
    expect(s.clicks).toBe(1500); expect(s.completed).toBe(true); expect(hit(s)).toBe(s);
  });
  it('cannot hit before starting', () => expect(hit(initialState)).toBe(initialState));
});
describe('restoration', () => {
  it('round trips confirmed state without repeating dialogs', () => {
    const s = { ...initialState, started: true, clicks: 1100, hammerConfirmed: true, knifeConfirmed: true, language: 'ja' as const };
    expect(restoreState(JSON.parse(JSON.stringify(s)))).toEqual(s);
    expect(pendingUnlock(restoreState(s))).toBeNull();
  });
  it('restores pending dialogs, including reload before confirmation', () => {
    expect(pendingUnlock(restoreState({ ...initialState, clicks: 500 }))).toBe('hammer');
    expect(pendingUnlock(restoreState({ ...initialState, clicks: 1000, hammerConfirmed: true }))).toBe('knife');
  });
  it('sanitizes invalid and future versions', () => {
    for (const value of [null, '{', {version: 2}]) expect(restoreState(value)).toEqual(initialState);
    expect(restoreState({...initialState, clicks: -10, language: 'bad'})).toEqual(initialState);
    expect(restoreState({...initialState, clicks: 0, completed: true}).clicks).toBe(1500);
    expect(restoreState({...initialState, clicks: Infinity}).clicks).toBe(0);
  });
  it('restores completed game without pending dialogs', () => {
    const s = restoreState({...initialState, clicks: 1500});
    expect(s.completed).toBe(true); expect(s.started).toBe(true); expect(pendingUnlock(s)).toBeNull();
  });
});
it('has all translations for all three languages', () => {
  for (const dictionary of Object.values(translations)) {
    expect(Object.keys(dictionary).sort()).toEqual(Object.keys(translations.es).sort());
    for (const text of Object.values(dictionary)) expect(text.trim().length).toBeGreaterThan(0);
  }
});
it('preserves all twelve original sprites byte for byte', () => {
  for (const phase of [1, 2, 3]) for (const state of ['normal', 'ouch']) {
    const path = `sprites/pchan/fase_0${phase}/fase0${phase}_${state}.png`;
    expect(existsSync(`public/${path}`)).toBe(true); expect(readFileSync(`public/${path}`).equals(readFileSync(path))).toBe(true);
  }
  for (const weapon of ['hand', 'hammer', 'knife']) for (const index of ['01', '02']) {
    const path = `sprites/curors/${weapon}/${weapon}_${index}.png`;
    expect(readFileSync(`public/${path}`).equals(readFileSync(path))).toBe(true);
  }
});

it('requires a name and preserves it when restoring', () => {
  const unnamed = {...initialState, started:true};
  expect(hit(unnamed)).toBe(unnamed);
  expect(restoreState({...initialState, playerName:'  Ame  '}).playerName).toBe('Ame');
  expect(restoreState({...initialState, playerName: 123}).playerName).toBe('');
});
it('cycles all fifteen phrases every fifty hits and safely inserts the name', () => {
  expect(getPhrase(49,'es','Ame')).toBeNull();
  expect(getPhrase(50,'es','Ame')).toBe('¿Por qué me golpeas, Ame?');
  expect(getPhrase(99,'es','Ame')).toBe(getPhrase(50,'es','Ame'));
  expect(getPhrase(500,'es','Ame')).toBe('Te perdono. Espero que seas feliz, Ame');
  expect(getPhrase(550,'es','Ame')).toBe('Duele mucho, Ame, duele mucho... Detente, por favor.');
  expect(getPhrase(750,'es','Ame')).toBe('... Duele.');
  expect(getPhrase(800,'es','Ame')).toBe(getPhrase(50,'es','Ame'));
  expect(getPhrase(800,'es','$&')).toBe('¿Por qué me golpeas, $&?');
  for (const list of Object.values(phrases)) expect(list).toHaveLength(15);
});

it.each([[499,1],[500,2],[549,2],[550,2],[999,2],[1000,3],[1049,3],[1050,3]])('equips the correct weapon at %i', (clicks, weapon) => expect(getWeaponPhase(clicks)).toBe(weapon));
it('resets incomplete sessions on reload while keeping preferences', () => {
  const s=restoreSessionState({...initialState,clicks:1100,started:true,playerName:'Ame',language:'ja',hammerConfirmed:true,knifeConfirmed:true});
  expect(s).toEqual({...initialState,playerName:'Ame',language:'ja'});
  expect(restoreSessionState({...initialState,clicks:2000,completed:false}).completed).toBe(false);
});
it('preserves completed endings on reload, including older endings', () => {
  expect(restoreSessionState({...initialState,clicks:1500,completed:true}).completed).toBe(true);
  expect(restoreSessionState({...initialState,clicks:2500,completed:true}).clicks).toBe(1500);
});

it('preserves the final sprite and configures exact black pauses', () => {
  const path='sprites/pchan/fase_04/fase04_final.png';
  expect(readFileSync(`public/${path}`).equals(readFileSync(path))).toBe(true);
  expect(ENDING_CONFIG.INTRO_MS).toBe(2000);
  expect(ENDING_CONFIG.BLACKOUT_MS).toBe(3000);
});
