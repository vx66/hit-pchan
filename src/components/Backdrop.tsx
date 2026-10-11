export function Backdrop() {
  return <div className="backdrop" aria-hidden="true"><div className="halo" /><div className="floor" />{Array.from({ length: 12 }, (_, i) => <span key={i} className={`decoration decoration-${i}`} style={{ '--i': i } as React.CSSProperties}>{i % 3 === 0 ? '♥' : i % 3 === 1 ? '✦' : '+'}</span>)}<div className="corner corner-tl" /><div className="corner corner-tr" /><div className="corner corner-bl" /><div className="corner corner-br" /></div>;
}
