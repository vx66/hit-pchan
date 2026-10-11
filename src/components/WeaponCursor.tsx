import { useEffect, useRef } from 'react';
import { sprites } from '../game/sprites';
import type { Impact } from './PChan';
export function WeaponCursor({ phase, impact, active }: { phase: 1 | 2 | 3; impact: Impact | null; active: boolean }) {
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function move(e: PointerEvent) {
      const el = cursor.current; if (!el) return;
      el.style.visibility = e.pointerType === 'mouse' ? 'visible' : 'hidden';
      el.style.left = `${e.clientX}px`; el.style.top = `${e.clientY}px`;
    }
    function hide() { if (cursor.current) cursor.current.style.visibility = 'hidden'; }
    window.addEventListener('pointermove', move); window.addEventListener('pointerdown', move); document.addEventListener('pointerleave', hide); window.addEventListener('blur', hide);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', move); document.removeEventListener('pointerleave', hide); window.removeEventListener('blur', hide); };
  }, []);
  return <>{<div ref={cursor} className={`weapon-cursor ${!active ? 'cursor-disabled' : ''}`} aria-hidden="true"><img key={impact?.id ?? 'idle'} className={impact ? `weapon-impact weapon-${phase}` : ''} src={impact ? sprites[phase].hitting : sprites[phase].idle} alt="" /></div>}{active && impact?.touch && <div className="touch-weapon" style={{ left: impact.x, top: impact.y }} aria-hidden="true"><img src={sprites[phase].hitting} alt="" /></div>}</>;
}
