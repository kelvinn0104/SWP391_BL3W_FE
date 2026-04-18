import { getApiBaseUrl, getToken } from '../lib/auth';

function keysToCamel(obj) {
  if (Array.isArray(obj)) return obj.map((value) => keysToCamel(value));
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    Object.keys(obj).forEach((key) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      result[camelKey] = keysToCamel(obj[key]);
    });
    return result;
  }
  return obj;
}

export async function getUserPointNow() {
  const token = getToken();
  const response = await fetch(`${getApiBaseUrl()}/api/Users/points/now`, {
    method: 'GET',
    headers: {
      accept: '*/*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error(data?.message || `Lỗi ${response.status}: ${response.statusText}`);
  }

  return keysToCamel(data ?? {});
}
