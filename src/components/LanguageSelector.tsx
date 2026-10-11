import type { Language } from '../game/gameLogic';
export function LanguageSelector({ language, label, onChange }: { language: Language; label: string; onChange: (l: Language) => void }) {
  return <div className="language-selector" role="group" aria-label={label}>{(['es', 'en', 'ja'] as const).map(l => <button key={l} type="button" lang={l} aria-pressed={language === l} onClick={() => onChange(l)}>{l === 'ja' ? '日本語' : l.toUpperCase()}</button>)}</div>;
}
