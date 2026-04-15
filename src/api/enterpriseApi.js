import { getApiBaseUrl, getToken } from '../lib/auth';

/**
 * Real API cho Enterprise Features
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

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function getCapacity() {
  const areas = await apiFetch('/api/area');
  // Transform to match FE expected shape if needed
  return { areas };
}

export async function updateCapacity(data) {
  // data is { areas: [...] }
  return await apiFetch('/api/area', {
    method: 'PUT',
    body: JSON.stringify(requestBody(data)),
  });
}

export async function deleteArea(id) {
  return await apiFetch(`/api/area/${id}`, {
    method: 'DELETE',
  });
}

export async function updateArea(id, data) {
  // data matches AreaResponse shape
  return await apiFetch(`/api/area/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

function requestBody(data) {
    // If FE sends { areas: [...] }, our BE expects { areas: [...] }
    return data;
}

export async function getRequests() {
  // TODO: Implement Request API in BE if needed
  return []; 
}

export async function getCollectors() {
  try {
      const response = await apiFetch('/api/users/collectors');
      // BE returns { id, email, displayName, role, points }
      // FE expects { id, name, phone }
      return response.map(c => ({
          id: c.id,
          name: c.displayName || c.email,
          phone: "Chưa cập nhật" // Mock phone for now as BE doesn't have it yet
      }));
  } catch (err) {
      console.warn("Collectors API error", err);
      return [];
  }
}

export async function assignRequest(requestId, collectorId) {
  return await apiFetch(`/api/requests/${requestId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ collectorId }),
  });
}

export async function updateRequestStatus(requestId, newStatus) {
  return await apiFetch(`/api/requests/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus }),
  });
}
