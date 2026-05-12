// ============================================================
// services/api.js — Worker API wrapper
// Requires: config.js + auth.js loaded before this file
// ============================================================

async function apiFetch(path, options = {}) {
  const token = await getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${APP_CONFIG.WORKER_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json;
}

// ── PUBLIC ────────────────────────────────────────────────

async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/products${qs ? '?' + qs : ''}`);
}

async function getProduct(nomor_seri) {
  return apiFetch(`/products/${encodeURIComponent(nomor_seri)}`);
}

// ── ADMIN ─────────────────────────────────────────────────

async function createProduct(data) {
  return apiFetch('/products', { method: 'POST', body: JSON.stringify(data) });
}

async function updateProduct(nomor_seri, data) {
  return apiFetch(`/products/${encodeURIComponent(nomor_seri)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

async function deleteProduct(nomor_seri) {
  return apiFetch(`/products/${encodeURIComponent(nomor_seri)}`, { method: 'DELETE' });
}

async function getAnalytics() {
  return apiFetch('/analytics');
}

async function getProductAnalytics(nomor_seri) {
  return apiFetch(`/analytics/${encodeURIComponent(nomor_seri)}`);
}
