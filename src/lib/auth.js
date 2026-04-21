const TOKEN_KEY = 'ecosort_token';
const USER_KEY = 'ecosort_user';

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5040';
}

/**
 * Resolve relative image URLs from the API.
 */
export function resolveImageUrl(path) {
  const s = String(path ?? '').trim();
  if (!s) return '';
  // If it's already an absolute URL (http/https) or a base64 string or a blob, return it.
  if (/^(https?:\/\/|data:|blob:)/i.test(s) || s.startsWith('//')) {
    return s;
  }
  const base = getApiBaseUrl().replace(/\/$/, '');
  return s.startsWith('/') ? `${base}${s}` : `${base}/${s}`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth({accessToken, user}, triggerEvent = true) {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem('ecosort_auth', '1'); // tương thích logic cũ ở header
  if (triggerEvent) {
    window.dispatchEvent(new Event('ecosort_auth_changed'));
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('ecosort_auth');
  window.dispatchEvent(new Event('ecosort_auth_changed'));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function fetchMe() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${getApiBaseUrl()}/api/users/me`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  // Token không còn hợp lệ (hết hạn hoặc DB đã đổi) → tự động đăng xuất
  if (res.status === 401) {
    clearAuth();
    return null;
  }

  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  // Nếu token đã bị xóa/đổi trong lúc chờ response thì không set lại auth.
  if (getToken() !== token) return null;
  setAuth({
    accessToken: token,
    user: { ...data }, // Lưu toàn bộ trường hồ sơ mới
  }, true); // Cập nhật và phát tín hiệu để các trang (như Profile) biết để làm mới giao diện

  return data;
}

