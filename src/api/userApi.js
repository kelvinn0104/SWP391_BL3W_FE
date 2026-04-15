import { getApiBaseUrl, getToken } from '../lib/auth';

/**
 * API cho User Profile
 */

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }

  return data;
}

export const updateProfile = async (profileData) => {
  return await apiFetch('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const getMe = async () => {
    return await apiFetch('/api/users/me');
};