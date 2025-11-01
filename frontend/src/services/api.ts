const API_URL = process.env.REACT_APP_API_URL;

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

const api = async (endpoint: string, options: ApiOptions = {}) => {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
};

export const generationsAPI = {
  create: (prompt: string, backend_framework: string, token: string) =>
    api('/generations', {
      method: 'POST',
      body: { prompt, backend_framework },
      token,
    }),

  list: (token: string, limit?: number, offset?: number) =>
    api(`/generations${limit ? `?limit=${limit}&offset=${offset}` : ''}`, {
      token,
    }),

  get: (id: string, token: string) =>
    api(`/generations/${id}`, { token }),

  refine: (id: string, prompt: string, token: string) =>
    api(`/generations/${id}/refine`, {
      method: 'POST',
      body: { prompt },
      token,
    }),

  export: (id: string, format: string, token: string) =>
    api(`/generations/${id}/export?format=${format}`, { token }),
};

export default api;
