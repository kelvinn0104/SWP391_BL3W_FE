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

/**
 * API cho Account Management (Admin/Enterprise)
 */
export const getCollectors = async () => {
  return await apiFetch('/api/accounts/collectors');
};

export const getCitizens = async () => {
  return await apiFetch('/api/accounts/citizens');
};

export const lockAccount = async (id, isLocked) => {
  return await apiFetch(`/api/accounts/${id}/lock`, {
    method: 'PATCH',
    body: JSON.stringify(isLocked),
  });
};

export const createCollector = async (data) => {
  return await apiFetch('/api/accounts/collectors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};