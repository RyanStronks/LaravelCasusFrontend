import { StatusError } from '../types/error';

type FetcherOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  token?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
};

export async function baseFetcher(url: string, options: FetcherOptions = {}) {
  const { method = 'GET', token, body, headers = {}, params } = options;

  let finalUrl = url;
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    finalUrl += (url.includes('?') ? '&' : '?') + query;
  }

  const fetchHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (token) {
    fetchHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    fetchHeaders['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(finalUrl, {
      method,
      headers: fetchHeaders,
      body: body
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
    });

    if (!res.ok) {
      const message = await res.text();
      throw new StatusError(message || 'Request failed', res.status);
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (error) {
    if (error instanceof StatusError) throw error;
    if (error instanceof Error) {
      throw new StatusError(error.message, 500);
    }
    throw new StatusError('An unexpected error occurred', 500);
  }
}
