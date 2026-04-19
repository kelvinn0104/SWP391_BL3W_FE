import { getApiBaseUrl, getToken } from '../lib/auth';

function keysToCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map((value) => keysToCamel(value));
  }
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

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const isFormDataBody = options.body instanceof FormData;
  const headers = {
    ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
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

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error(data?.message || `Lỗi ${response.status}: ${response.statusText}`);
  }

  return keysToCamel(data);
}

/**
 * GET /api/collector/jobs/collector-report-assigned
 * Danh sách báo cáo được giao cho collector đăng nhập.
 */
export async function getCollectorAssignedReports() {
  const data = await apiFetch('/api/collector/jobs/collector-report-assigned');
  return Array.isArray(data) ? data : [];
}

/**
 * GET /api/collector/jobs/{reportId}/detail
 * Chi tiết một công việc thu gom.
 */
export async function getCollectorJobDetail(reportId) {
  const safe = encodeURIComponent(String(reportId));
  return apiFetch(`/api/collector/jobs/${safe}/detail`);
}

/**
 * PATCH /api/collector/jobs/{reportId}/status
 * Body JSON: { status, note? } — status theo WasteReportStatus (ví dụ Assigned, Accepted, Pending, Collected).
 */
export async function updateCollectorJobStatus(reportId, { status, note }) {
  const safe = encodeURIComponent(String(reportId));
  return apiFetch(`/api/collector/jobs/${safe}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}

/**
 * POST /api/collector/jobs/{reportId}/complete
 * multipart/form-data:
 * - Images, ProofImages: lặp key cho từng file
 * - Note, CompletionNote, CompletedAtUtc (ISO 8601)
 * - WasteReportItemIds, ActualWeightKgs: hai mảnh song song cùng độ dài (bắt buộc theo nghiệp vụ backend)
 */
export async function completeCollectorJob(reportId, payload = {}) {
  const {
    images = [],
    proofImages = [],
    note,
    completionNote,
    completedAtUtc,
    wasteReportItemIds = [],
    actualWeightKgs = [],
  } = payload;

  const safe = encodeURIComponent(String(reportId));
  const formData = new FormData();

  (images ?? []).forEach((file) => {
    if (file && file.size > 0) {
      formData.append('Images', file);
    }
  });
  (proofImages ?? []).forEach((file) => {
    if (file && file.size > 0) {
      formData.append('ProofImages', file);
    }
  });

  if (note != null && note !== '') {
    formData.append('Note', note);
  }
  if (completionNote != null && completionNote !== '') {
    formData.append('CompletionNote', completionNote);
  }
  if (completedAtUtc != null && completedAtUtc !== '') {
    formData.append('CompletedAtUtc', completedAtUtc);
  }

  (wasteReportItemIds ?? []).forEach((id) => {
    formData.append('WasteReportItemIds', String(id));
  });
  (actualWeightKgs ?? []).forEach((w) => {
    formData.append('ActualWeightKgs', String(w));
  });

  return apiFetch(`/api/collector/jobs/${safe}/complete`, {
    method: 'POST',
    body: formData,
  });
}
