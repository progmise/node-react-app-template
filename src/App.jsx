import { useEffect, useState } from 'react';

export default function App() {
  const [ping, setPing] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    fetch('/api/ping').then((r) => r.json()).then(setPing);
    fetch('/api/me').then((r) => (r.ok ? r.json() : null)).then(setMe);
  }, []);

  return (
    <main>
      <header>
        <h1>App</h1>
        <p className="muted">React + Vite + Express</p>
        <div className="user">
          {me ? (
            <>
              <img src={me.avatar_url} alt="" width="24" height="24" />
              <span>{me.login}</span>
              <a href="/api/logout">Sign out</a>
            </>
          ) : (
            <a className="login-btn" href="/api/auth/login">Sign in with GitHub</a>
          )}
        </div>
      </header>

      <div className="card">
        <code>/api/ping</code> → {ping ? JSON.stringify(ping) : '…'}
      </div>
    </main>
  );
}
