import { getApiBaseUrl, getToken } from '../lib/auth';

/**
 * Area API - Real Backend Connections
 * Handles Area, Ward, and Request management.
 */

/**
 * Recursive helper to convert PascalCase keys to camelCase
 */
function keysToCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamel(v));
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    Object.keys(obj).forEach(key => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      result[camelKey] = keysToCamel(obj[key]);
    });
    return result;
  }
  return obj;
}

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

  // 1. Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  // 2. Safely extract response body
  const contentType = response.headers.get("content-type");
  let data = null;
  
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (e) {
      console.error("Failed to parse JSON body", e);
    }
  }

  // 3. Handle Business Errors
  if (!response.ok) {
    const errorMsg = data?.message || `Lỗi ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  // 4. Transform PascalCase to camelCase (BE standard to FE standard)
  return keysToCamel(data);
}

// --- Capacity & Areas (REAL BE) ---

export const getCapacity = async () => {
    // Correct endpoint from AreaController.cs
    const data = await apiFetch('/api/Area');
    // Area.jsx expects { areas: [...] } 
    return { areas: data || [] };
};

export const updateCapacity = async (data) => {
  // Correct endpoint from AreaController.cs
  // It expects { areas: [...] } for BulkUpdate
  return await apiFetch('/api/Area', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteArea = async (id) => {
  return await apiFetch(`/api/Area/${id}`, {
    method: 'DELETE',
  });
};

export const updateArea = async (id, data) => {
  return await apiFetch(`/api/Area/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// --- Requests & Collectors (REAL BE) ---

export const getRequests = async () => {
    return await apiFetch('/api/requests'); 
};

export const getCollectors = async () => {
    // Correct endpoint from UsersController.cs
    return await apiFetch('/api/Users/collectors');
};

export const assignRequest = async (requestId, collectorId) => {
  return await apiFetch(`/api/requests/${requestId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ collectorId }),
  });
};

export const updateRequestStatus = async (requestId, newStatus) => {
  return await apiFetch(`/api/requests/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus }),
  });
};