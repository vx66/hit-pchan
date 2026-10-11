import { useState } from 'react';
import { sprites } from '../game/sprites';
import type { Translation } from '../i18n/es';
export function StartScreen({ t, ready, error, playerName, onStart }: { t: Translation; ready: boolean; error: boolean; playerName: string; onStart: (name: string) => void }) {
  const [name, setName] = useState(playerName);
  return <main className="scene start-screen"><h1>{t.startTitle}</h1><div className="character-stage"><div className="character-shadow" /><img className="start-character" src={sprites[1].normal} alt="P-Chan" draggable={false} /></div><form className="start-form" onSubmit={e => { e.preventDefault(); if (ready && name.trim()) onStart(name.trim()); }}><label htmlFor="player-name">{t.nameLabel}</label><input id="player-name" name="playerName" autoComplete="given-name" maxLength={24} required value={name} onChange={e => setName(e.target.value)} placeholder={t.namePlaceholder} /><button type="submit" className="pixel-button start-button" disabled={!ready || !name.trim()}>{error ? t.error : ready ? t.start : t.loading}<span aria-hidden="true"> ▶</span></button></form></main>;
}
