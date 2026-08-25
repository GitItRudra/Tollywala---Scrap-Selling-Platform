// In local dev this stays '/api' and goes through Vite's proxy to
// localhost:4000. In production (a Vercel static build), there's no dev
// proxy, so set VITE_API_BASE_URL to your deployed backend's full URL,
// e.g. https://tollywala-api.onrender.com/api
const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),

  stats: (token) => request('/admin/stats', { token }),

  materials: (token) => request('/admin/materials', { token }),
  createMaterial: (payload, token) => request('/admin/materials', { method: 'POST', body: payload, token }),
  updateMaterial: (id, payload, token) => request(`/admin/materials/${id}`, { method: 'PUT', body: payload, token }),
  deleteMaterial: (id, token) => request(`/admin/materials/${id}`, { method: 'DELETE', token }),

  bookings: (token) => request('/admin/bookings', { token }),
  updateBookingStatus: (id, status, token) =>
    request(`/admin/bookings/${id}/status`, { method: 'PATCH', body: { status }, token }),

  users: (token) => request('/admin/users', { token }),
};
