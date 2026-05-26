export async function getApiUrl() {
  try {
    const basePath = import.meta.env.BASE_URL || '/';
    const configUrl = `${basePath}config.json`.replace(/\/+/g, '/');
    const response = await fetch(configUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const config = await response.json();
    if (!config.API_URL) throw new Error('API_URL no definida en config.json');
    return config.API_URL;
  } catch (error) {
    console.warn('Usando fallback');
    return 'https://fulage.alwaysdata.net/api';
  }
}

export async function apiRequest(endpoint, options = {}) {
  const baseUrl = await getApiUrl();
  const url = `${baseUrl}/${endpoint}`.replace(/\/+/g, '/').replace('https:/', 'https://');

  const { headers: extraHeaders, body, ...restOptions } = options;

  const finalOptions = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders
    },
    body: body ? JSON.stringify(body) : undefined
  };

  const response = await fetch(url, finalOptions);
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export async function uploadRequest(endpoint, formData, token = null) {
  const baseUrl = await getApiUrl();
  const url = `${baseUrl}/${endpoint}`.replace(/\/+/g, '/').replace('https:/', 'https://');

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}