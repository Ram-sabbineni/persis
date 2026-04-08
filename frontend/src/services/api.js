import axios from 'axios';

/**
 * Local dev: baseURL is '' so requests go to Vite (same origin); vite.config.js proxies /api → API.
 * Production: set VITE_API_BASE_URL to your App Service URL before `npm run build`.
 */
const baseURL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || '');

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

function friendlyNetworkMessage(err) {
  if (!err.response && err.request) {
    return import.meta.env.DEV
      ? 'Cannot reach the API. Run the backend (dotnet run in backend/Persis.Api) and ensure it listens on the port in vite.config proxy (default http://localhost:5288).'
      : 'Cannot reach the API. Check VITE_API_BASE_URL and that the backend is running.';
  }
  return err?.message || 'Request failed';
}

/** Fetch all menu items (GET /api/menu). */
export async function fetchMenu() {
  try {
    const { data } = await api.get('/api/menu');
    return data;
  } catch (e) {
    throw new Error(friendlyNetworkMessage(e));
  }
}

/** Single menu item (GET /api/menu/:id). */
export async function fetchMenuItem(id) {
  try {
    const { data } = await api.get(`/api/menu/${id}`);
    return data;
  } catch (e) {
    throw new Error(friendlyNetworkMessage(e));
  }
}

/** Place order (POST /api/orders). */
export async function placeOrder(payload) {
  try {
    const { data } = await api.post('/api/orders', payload);
    return data;
  } catch (e) {
    const body = e.response?.data;
    const msg = body?.message || body?.detail || body?.title;
    if (msg && typeof msg === 'string') throw new Error(msg);
    throw new Error(friendlyNetworkMessage(e));
  }
}
