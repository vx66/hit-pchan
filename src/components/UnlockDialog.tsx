import { useEffect, useRef } from 'react';
import type { Unlock } from '../game/gameLogic';
import type { Translation } from '../i18n/es';
import { sprites } from '../game/sprites';
export function UnlockDialog({ unlock, t, onContinue }: { unlock: Unlock; t: Translation; onContinue: () => void }) {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    button.current?.focus();
    function trap(e: KeyboardEvent) { if (e.key === 'Tab') { e.preventDefault(); button.current?.focus(); } }
    document.addEventListener('keydown', trap);
    return () => { document.removeEventListener('keydown', trap); previous?.focus(); };
  }, []);
  return <div className="dialog-overlay"><section className="unlock-dialog" role="dialog" aria-modal="true" aria-labelledby="unlock-text"><div className="window-bar"><span>{t.acquired}</span><span aria-hidden="true">♥</span></div><div className="dialog-content"><div className="item-frame"><img src={sprites[unlock === 'hammer' ? 2 : 3].idle} alt="" draggable={false} /><span aria-hidden="true">✦</span></div><p id="unlock-text">{t[unlock]}</p><button ref={button} className="pixel-button" onClick={onContinue}>{t.continue} <span aria-hidden="true">♥</span></button></div></section></div>;
}
