import './mode-toggle.css';

export function ModeToggle({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="mode-toggle" onClick={onOpen} aria-label="Open terminal mode (or press Ctrl/Cmd + K)">
      <span aria-hidden="true">{'>_'}</span>
    </button>
  );
}
