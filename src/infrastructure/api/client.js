// Fetch wrapper for the same-origin /api backend. Returns parsed JSON on
// success, null on non-2xx — callers decide what "no data" means.
export const apiGet = (path) =>
  fetch(path).then((r) => (r.ok ? r.json() : null));

export const apiSend = (path, method, body) =>
  fetch(path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }).then(async (r) => ({ ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) }));
