import { useSession } from '../application/useSession.js';
import { usePing } from '../application/usePing.js';
import SessionMenu from '../ui/features/session/SessionMenu.jsx';

export default function App() {
  const me = useSession();
  const ping = usePing();

  return (
    <main>
      <header>
        <h1>App</h1>
        <p className="muted">React + Vite + Express</p>
        <SessionMenu user={me} />
      </header>

      <div className="card">
        <code>/api/ping</code> → {ping ? JSON.stringify(ping) : '…'}
      </div>
    </main>
  );
}
