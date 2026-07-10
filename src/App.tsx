import { lazy, Suspense } from 'react';
import { useMode } from './lib/useMode';
import { StandardSite } from './components/standard/StandardSite';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { Skeleton } from './components/ui/skeleton';
// Eager so the loading/failure fallbacks below are styled even when the lazy
// terminal chunk itself never arrives. The file is ~3 kB.
import './components/terminal/terminal.css';

// Most visitors never open the terminal, so keep it (and the command/vfs
// modules behind it) out of the main bundle.
const Terminal = lazy(() =>
  import('./components/terminal/Terminal').then((m) => ({ default: m.Terminal })),
);

/** Loading state while the terminal chunk downloads: the familiar frame with
 *  skeleton scanlines where the prompt will appear. */
function TerminalLoading() {
  return (
    <div className="term-root" role="dialog" aria-modal="true" aria-label="Loading terminal">
      <div className="term-bar">
        <span className="term-dot term-dot--red" />
        <span className="term-dot term-dot--amber" />
        <span className="term-dot term-dot--green" />
        <span className="term-title">visitor@portfolio</span>
      </div>
      <div className="term-screen">
        <div className="flex max-w-md flex-col gap-2.5 p-1">
          <Skeleton className="h-3.5 w-3/4 bg-[#1f2733]" />
          <Skeleton className="h-3.5 w-1/2 bg-[#1f2733]" />
          <Skeleton className="h-3.5 w-2/3 bg-[#1f2733]" />
        </div>
      </div>
    </div>
  );
}

/** Failure state if the chunk can't load (offline, flaky network). Escape or
 *  the red dot closes; reopening remounts the boundary and retries. */
function TerminalError({ onClose }: { onClose: () => void }) {
  return (
    <div className="term-root" role="alertdialog" aria-modal="true" aria-label="Terminal failed to load">
      <div className="term-bar">
        <button type="button" className="term-dot term-dot--red" aria-label="Close terminal" onClick={onClose} />
        <span className="term-title">visitor@portfolio — error</span>
      </div>
      <div className="term-screen">
        <div className="term-line term-error">failed to load the terminal — network hiccup?</div>
        <div className="term-line">close with Escape (or the red dot) and try again.</div>
      </div>
    </div>
  );
}

export default function App() {
  const { mode, open, close } = useMode();
  return (
    <>
      <StandardSite onOpenTerminal={open} terminalOpen={mode === 'terminal'} />
      {mode === 'terminal' && (
        // Boundary remounts on every open, so a failed chunk load is retried
        // next time instead of leaving terminal mode permanently broken.
        <ErrorBoundary fallback={<TerminalError onClose={close} />}>
          <Suspense fallback={<TerminalLoading />}>
            <Terminal onExit={close} />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
}
