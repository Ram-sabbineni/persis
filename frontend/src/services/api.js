import axios from 'axios';

/**
 * Base URL for the Persis API (Azure App Service or local Kestrel).
 * Set VITE_API_BASE_URL in .env — Vite only exposes vars prefixed with VITE_.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5288';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

/** Fetch all menu items (GET /api/menu). */
export async function fetchMenu() {
  const { data } = await api.get('/api/menu');
  return data;
}

/** Single menu item (GET /api/menu/:id). */
export async function fetchMenuItem(id) {
  const { data } = await api.get(`/api/menu/${id}`);
  return data;
}

/** Place order (POST /api/orders). */
export async function placeOrder(payload) {
  const { data } = await api.post('/api/orders', payload);
  return data;
}
