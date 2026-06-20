const CHIPS = ['help', 'about', 'projects', 'skills', 'contact', 'exit'];

export function CommandChips({ onPick }: { onPick: (cmd: string) => void }) {
  return (
    <div className="term-chips" aria-label="quick commands">
      {CHIPS.map((c) => (
        <button key={c} type="button" className="term-chip" onClick={() => onPick(c)}>
          {c}
        </button>
      ))}
    </div>
  );
}
