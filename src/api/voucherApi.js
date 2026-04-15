import { getApiBaseUrl, getToken } from '../lib/auth';

/**
 * Real API cho Voucher Management
 */

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Nếu body là FormData, không set Content-Type để trình duyệt tự quyết định (multipart/form-data)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function getVouchers() {
  return await apiFetch('/api/vouchers');
}

export async function getVoucherCategories() {
  return await apiFetch('/api/vouchers/categories');
}

export async function createVoucher(formData) {
  return await apiFetch('/api/vouchers', {
    method: 'POST',
    body: formData,
  });
}

export async function updateVoucher(id, formData) {
  return await apiFetch(`/api/vouchers/${id}`, {
    method: 'PUT',
    body: formData, 
  });
}

export async function deleteVoucher(id) {
  return await apiFetch(`/api/vouchers/${id}`, {
    method: 'DELETE',
  });
}

export async function createCategory(data) {
  return await apiFetch('/api/vouchers/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getRedemptionHistory() {
  return await apiFetch('/api/vouchers/history');
}

export async function redeemVoucher(voucherId) {
  return await apiFetch(`/api/vouchers/redeem/${voucherId}`, {
    method: 'POST',
  });
}