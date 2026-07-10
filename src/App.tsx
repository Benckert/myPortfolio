import { lazy, Suspense } from 'react';
import { useMode } from './lib/useMode';
import { StandardSite } from './components/standard/StandardSite';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

// Most visitors never open the terminal, so keep it (and the command/vfs
// modules behind it) out of the main bundle.
const Terminal = lazy(() =>
  import('./components/terminal/Terminal').then((m) => ({ default: m.Terminal })),
);

export default function App() {
  const { mode, open, close } = useMode();
  return (
    <>
      <StandardSite onOpenTerminal={open} terminalOpen={mode === 'terminal'} />
      {mode === 'terminal' && (
        // Boundary remounts on every open, so a failed chunk load is retried
        // next time instead of leaving terminal mode permanently broken.
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Terminal onExit={close} />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
}
