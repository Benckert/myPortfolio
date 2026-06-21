import { useMode } from './lib/useMode';
import { Terminal } from './components/terminal/Terminal';
import { StandardSite } from './components/standard/StandardSite';

export default function App() {
  const { mode, open, close } = useMode();
  return (
    <>
      <StandardSite onOpenTerminal={open} />
      {mode === 'terminal' && <Terminal onExit={close} />}
    </>
  );
}
