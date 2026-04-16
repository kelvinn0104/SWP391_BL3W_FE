import { getApiBaseUrl, getToken } from '../lib/auth';

/**
 * API common helper for collection requests
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

export const getRequests = async () => {
  return await apiFetch('/api/requests');
};

export const getRequestById = async (id) => {
  return await apiFetch(`/api/requests/${id}`);
};

export const updateRequestStatus = async (id, status, cancellationReason = null) => {
  return await apiFetch(`/api/requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ 
      status, 
      cancellationReason 
    }),
  });
};

export const assignRequest = async (id, collectorId) => {
  return await apiFetch(`/api/requests/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ 
      collectorId 
    }),
  });
};

export const getMyRequests = async () => {
  return await apiFetch('/api/requests/my-requests');
};