import { useMode } from './lib/useMode';
import { Terminal } from './components/terminal/Terminal';
import { ModeToggle } from './components/shared/ModeToggle';

export default function App() {
  const { mode, open, close } = useMode();
  return (
    <>
      {/* StandardSite is implemented in Tasks 10–12; stub for now */}
      <main style={{ padding: 40 }}>
        <h1>Standard site coming soon</h1>
        <p>Press the backtick key or the button to open the terminal.</p>
      </main>
      <ModeToggle onOpen={open} />
      {mode === 'terminal' && <Terminal onExit={close} />}
    </>
  );
}
