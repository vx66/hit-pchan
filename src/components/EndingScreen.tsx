import { useEffect, useRef, useState } from 'react';
import { ENDING_CONFIG as C } from '../game/constants';
import { ENDING_SPRITE } from '../game/sprites';
import { CreatorCredit } from './CreatorCredit';
type Stage = 'intro' | 'message' | 'blackout' | 'scare' | 'outro' | 'replay';
interface Props { text: string; continueLabel: string; threat: string; replay: string; credit: string; onReplay: () => void }
export function EndingScreen({ text, continueLabel, threat, replay, credit, onReplay }: Props) {
  const [stage, setStage] = useState<Stage>('intro');
  const [length, setLength] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const message = useRef<HTMLDivElement>(null);
  const action = useRef<HTMLButtonElement>(null);
  const followingText = useRef(true);
  const complete = length >= text.length;

  useEffect(() => {
    let live = true;
    const image = new Image();
    image.onerror = () => { if (live) setImageFailed(true); };
    image.src = ENDING_SPRITE;
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (stage !== 'message') return;
    followingText.current = true;
    setLength(reducedMotion ? text.length : 0);
    if (reducedMotion) return;
    let count = 0;
    const timer = window.setInterval(() => {
      count = Math.min(text.length, count + 1);
      setLength(count);
      if (count === text.length) window.clearInterval(timer);
    }, C.CHARACTER_MS);
    return () => window.clearInterval(timer);
  }, [stage, text, reducedMotion]);

  useEffect(() => {
    const el = message.current;
    if (el && followingText.current && !reducedMotion) el.scrollTop = el.scrollHeight;
  }, [length, reducedMotion]);

  useEffect(() => {
    let next: Stage | undefined;
    let delay = 0;
    if (stage === 'intro') { next = 'message'; delay = C.INTRO_MS; }
    if (stage === 'scare') { next = 'outro'; delay = C.SCARE_MS; }
    if (stage === 'outro') { next = 'replay'; delay = C.OUTRO_MS; }
    if (!next) return;
    const timer = window.setTimeout(() => setStage(next!), delay);
    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'blackout') return;
    const timer = window.setTimeout(() => setStage(imageFailed ? 'replay' : 'scare'), C.BLACKOUT_MS);
    return () => window.clearTimeout(timer);
  }, [stage, imageFailed]);

  useEffect(() => {
    if ((stage === 'message' && complete) || stage === 'replay') action.current?.focus({ preventScroll: true });
  }, [stage, complete]);

  return <main className={`ending-screen ending-sequence ending-${stage}`} data-stage={stage}>
    {stage === 'message' && <>
      <div ref={message} className="ending-message-scroll" tabIndex={0} onScroll={e => { const el = e.currentTarget; followingText.current = el.scrollHeight - el.scrollTop - el.clientHeight < 36; }}>
        <p aria-label={text}><span aria-hidden="true">{text.slice(0, length)}{!complete && <span className="caret">▌</span>}</span></p>
      </div>
      <div className="ending-action-slot">{complete && <button ref={action} className="pixel-button replay-button" onClick={() => setStage('blackout')}>{continueLabel}</button>}</div>
    </>}
    {stage === 'scare' && <div className="ending-scare-content"><img className="ending-scare-image" src={ENDING_SPRITE} alt="P-Chan" draggable={false} /><p className="ending-threat">{threat}</p></div>}
    {stage === 'replay' && <><button ref={action} className="pixel-button replay-button" onClick={onReplay}>{replay}</button><CreatorCredit label={credit} dark /></>}
  </main>;
}
