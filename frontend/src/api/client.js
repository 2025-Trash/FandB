// meit/frontend/src/api/client.js
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const storage = {
  get access()  { return localStorage.getItem("access"); },
  set access(v) { localStorage.setItem("access", v); },
  get refresh() { return localStorage.getItem("refresh"); },
  set refresh(v){ localStorage.setItem("refresh", v); },
  clear()       { localStorage.removeItem("access"); localStorage.removeItem("refresh"); }
};

async function request(path, { method="GET", headers={}, body, retry=true } = {}) {
  const h = { "Content-Type": "application/json", ...headers };
  if (storage.access) h.Authorization = `Bearer ${storage.access}`;

  const res = await fetch(`${API_BASE}${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });

  // 성공
  if (res.ok) return res.json().catch(() => ({}));

  // 401 → 토큰 갱신 시도 (한 번만)
  if (res.status === 401 && retry && storage.refresh) {
    const ok = await refreshAccessToken();
    if (ok) return request(path, { method, headers, body, retry: false });
  }

  // 실패 응답 throw
  const text = await res.text().catch(() => "");
  throw new Error(`${res.status} ${res.statusText} ${text}`);
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: storage.refresh })
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.access) storage.access = data.access;
    return !!data.access;
  } catch {
    return false;
  }
}

export const api = {
  // Auth
  async register({ username, email, password }) {
    return request(`/api/auth/register/`, { method: "POST", body: { username, email, password } });
  },
  async login({ username, password }) {
    const data = await request(`/api/auth/token/`, { method: "POST", body: { username, password }, retry: false });
    storage.access  = data.access;
    storage.refresh = data.refresh;
    return data;
  },
  logout() { storage.clear(); },

  // Trees
  addTree({ delta=1, reason="" }) {
    return request(`/api/trees/add/`, { method: "POST", body: { delta, reason } });
  },
  myTrees() {
    return request(`/api/trees/me/`);
  },
  globalTrees() {
    return request(`/api/trees/global/`, { retry: false }); // 퍼블릭 엔드포인트
  },

  // 기타 유틸
  isLoggedIn() { return !!storage.access; },
};