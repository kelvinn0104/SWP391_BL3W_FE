import { getApiBaseUrl, getToken } from '../lib/auth';

/**
 * API cho User Profile
 */

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Token expired or unauthorized");
    }
    const errorText = await response.text();
    throw new Error(errorText || `Error ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export const updateProfile = async (profileData) => {
  const formData = new FormData();
  Object.keys(profileData).forEach(key => {
    if (profileData[key] !== undefined && profileData[key] !== null) {
      formData.append(key, profileData[key]);
    }
  });

  return await apiFetch('/api/users/profile', {
    method: 'PUT',
    body: formData,
  });
};

export const getMe = async () => {
  return await apiFetch('/api/users/me');
};

/**
 * API cho Account Management (Admin/Enterprise)
 */
export const getCollectors = async (wardId = null) => {
  const query = wardId ? `?wardId=${wardId}` : '';
  return await apiFetch(`/api/accounts/collectors${query}`);
};

export const getCitizens = async () => {
  return await apiFetch('/api/accounts/citizens');
};

export const lockAccount = async (id, isLocked) => {
  return await apiFetch(`/api/accounts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isLocked }),
  });
};

export const updateAccount = async (id, data) => {
  return await apiFetch(`/api/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteAccount = async (id) => {
  return await apiFetch(`/api/accounts/${id}`, {
    method: 'DELETE',
  });
};

export const createCollector = async (data) => {
  return await apiFetch('/api/accounts/collectors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};