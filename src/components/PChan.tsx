import { useEffect, useRef, type MouseEvent } from 'react';
import { sprites } from '../game/sprites';
export interface Impact { id: number; x: number; y: number; touch: boolean }
export function PChan({ phase, weaponPhase, impact, label, disabled, onHit }: { phase: 1 | 2 | 3; weaponPhase: 1 | 2 | 3; impact: Impact | null; label: string; disabled: boolean; onHit: (x: number, y: number, touch: boolean) => void }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const mask = useRef<ImageData | null>(null);
  const pointerType = useRef('mouse');
  useEffect(() => {
    mask.current = null;
    let active = true;
    const img = new Image(); img.src = sprites[phase].normal;
    img.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx && active) { ctx.drawImage(img, 0, 0); mask.current = ctx.getImageData(0, 0, img.width, img.height); }
    };
    return () => { active = false; };
  }, [phase]);
  function click(e: MouseEvent<HTMLButtonElement>) {
    if (disabled || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const keyboard = e.detail === 0;
    const x = keyboard ? rect.left + rect.width / 2 : e.clientX;
    const y = keyboard ? rect.top + rect.height / 2 : e.clientY;
    if (!keyboard && !mask.current) return;
    if (!keyboard && mask.current) {
      const px = Math.floor((x - rect.left) / rect.width * mask.current.width);
      const py = Math.floor((y - rect.top) / rect.height * mask.current.height);
      if (px < 0 || py < 0 || px >= mask.current.width || py >= mask.current.height || mask.current.data[(py * mask.current.width + px) * 4 + 3] < 20) return;
    }
    onHit(x, y, !keyboard && pointerType.current !== 'mouse');
  }
  return <div className="character-stage"><div className="character-shadow" /><button type="button" className={`pchan ${impact ? `impact-${weaponPhase}` : ''}`} aria-label={label} aria-disabled={disabled} onPointerDown={e => { pointerType.current = e.pointerType; }} onClick={click}><img key={impact?.id ?? 'idle'} ref={imgRef} src={impact ? sprites[phase].ouch : sprites[phase].normal} alt="" draggable={false} /></button></div>;
}
