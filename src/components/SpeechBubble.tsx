import { useEffect, useState } from 'react';
import { SPEECH_MS } from '../game/constants';
export function SpeechBubble({ text }: { text: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setVisible(false), SPEECH_MS); return () => clearTimeout(timer); }, []);
  return visible ? <div className={`speech-bubble${text.length > 95 ? ' speech-bubble-long' : ''}`} role="status" aria-live="polite">{text}</div> : null;
}
