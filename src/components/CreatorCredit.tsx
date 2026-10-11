export function CreatorCredit({ label, dark = false }: { label: string; dark?: boolean }) {
  return <footer className={`creator-credit${dark ? ' creator-credit-dark' : ''}`}>{label} <a href="https://x.com/xergno" target="_blank" rel="noopener noreferrer">Xergno</a></footer>;
}
