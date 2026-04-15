import { getApiBaseUrl, getToken } from '../lib/auth';

/**
 * Real API cho Voucher Management
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

export async function createVoucher(data) {
  return await apiFetch('/api/vouchers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVoucher(id, data) {
  return await apiFetch(`/api/vouchers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
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