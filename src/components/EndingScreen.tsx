import { useEffect, useState } from 'react';
export function EndingScreen({ text, replay, onReplay }: { text: string; replay: string; onReplay: () => void }) {
  const [length, setLength] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setLength(text.length); return; }
    setLength(0);
    const timer = window.setInterval(() => setLength(n => { if (n >= text.length) window.clearInterval(timer); return Math.min(text.length, n + 1); }), 48);
    return () => window.clearInterval(timer);
  }, [text]);
  return <main className="ending-screen"><p aria-label={text}><span aria-hidden="true">{text.slice(0, length)}{length < text.length && <span className="caret">▌</span>}</span></p><button className="pixel-button replay-button" onClick={onReplay}>{replay}</button></main>;
}
