// System/session endpoints — the only file that knows these URLs.
import { apiGet } from './client.js';

export const systemApi = {
  ping: () => apiGet('/api/ping'),
  me: () => apiGet('/api/me'),
};
