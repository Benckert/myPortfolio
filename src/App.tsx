import { lazy, Suspense } from 'react';
import { useMode } from './lib/useMode';
import { StandardSite } from './components/standard/StandardSite';

// Most visitors never open the terminal, so keep it (and the command/vfs
// modules behind it) out of the main bundle.
const Terminal = lazy(() =>
  import('./components/terminal/Terminal').then((m) => ({ default: m.Terminal })),
);

export default function App() {
  const { mode, open, close } = useMode();
  return (
    <>
      <StandardSite onOpenTerminal={open} />
      {mode === 'terminal' && (
        <Suspense fallback={null}>
          <Terminal onExit={close} />
        </Suspense>
      )}
    </>
  );
}
