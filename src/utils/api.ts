import { useAuthStore } from '../store/authStore';

const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || `请求失败: ${res.status}`);
  }

  return res.json();
}

export const api = {
  login: (data: { username: string; password: string; role: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getOverview: () => apiRequest('/dashboard/overview'),
  getHeatmap: (floor: number) => apiRequest(`/dashboard/heatmap?floor=${floor}`),
  getEntrances: () => apiRequest('/dashboard/entrances'),
  getTrend: (days: number = 7) => apiRequest(`/dashboard/trend?days=${days}`),
  getUploadRecords: () => apiRequest('/upload/records'),
  uploadData: (data: { fileName: string; source: string }) =>
    apiRequest('/upload', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getCompare: (params: { fromA: string; toA: string; fromB: string; toB: string }) =>
    apiRequest(
      `/compare?fromA=${params.fromA}&toA=${params.toA}&fromB=${params.fromB}&toB=${params.toB}`
    ),
  getTenantDashboard: () => apiRequest('/tenant/dashboard')
};
