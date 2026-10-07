import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const app = express();
const PORT = process.env.PORT || 8080;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const COOKIE = 'gh_token';
// Comma-separated GitHub logins allowed to sign in. Empty = any GitHub user.
const ALLOWED = new Set(
  (process.env.ALLOWED_USERS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean));

const baseUrl = (req) =>
  `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers['x-forwarded-host'] || req.headers.host}`;

const readCookie = (req) =>
  (req.headers.cookie || '').split(';').map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))?.split('=')[1];

const ghFetch = (token, url, opts = {}) =>
  fetch(url, {
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });

// --- Example endpoint --------------------------------------------------------

app.get('/api/ping', (_req, res) => res.json({ message: 'pong' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: pkg.version }));

// --- Auth (GitHub OAuth — optional infra, works once GITHUB_CLIENT_* are set) --

app.get('/api/auth/login', (req, res) => {
  const redirect = `${baseUrl(req)}/api/auth/callback`;
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirect)}&scope=read:user`,
  );
});

const allowed = (login) => !ALLOWED.size || ALLOWED.has(login.toLowerCase());

app.get('/api/auth/callback', async (req, res) => {
  const r = await ghFetch(null, 'https://github.com/login/oauth/access_token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: req.query.code,
    }),
  });
  const data = await r.json();
  if (!data.access_token) return res.status(401).send('OAuth failed');
  if (ALLOWED.size) {
    const u = await ghFetch(data.access_token, 'https://api.github.com/user');
    const user = u.ok ? await u.json() : null;
    if (!user || !allowed(user.login))
      return res.status(403).send('User not authorized');
  }
  res.setHeader('Set-Cookie',
    `${COOKIE}=${data.access_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`);
  res.redirect('/');
});

app.get('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; Max-Age=0`);
  res.redirect('/');
});

app.get('/api/me', async (req, res) => {
  const token = readCookie(req);
  if (!token) return res.status(401).json({ error: 'not authenticated' });
  const r = await ghFetch(token, 'https://api.github.com/user');
  if (!r.ok) return res.status(401).json({ error: 'bad token' });
  const u = await r.json();
  if (!allowed(u.login)) return res.status(403).json({ error: 'not authorized' });
  res.json({ login: u.login, avatar_url: u.avatar_url });
});

// --- SPA -------------------------------------------------------------------

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
app.use(express.static(dist));
// SPA fallback only for extension-less routes — missing assets must 404,
// not serve HTML (breaks module loading with confusing MIME errors).
app.use((req, res) =>
  req.path.includes('.')
    ? res.sendStatus(404)
    : res.sendFile(path.join(dist, 'index.html')));

app.listen(PORT, () => console.log(`${pkg.name}:${pkg.version} on :${PORT}`));
