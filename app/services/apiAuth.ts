import { StatusError } from '../types/error';

export async function apiFetcher(url: string, token: string) {
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const message = await res.text();
      throw new StatusError(message || 'Request failed', res.status);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof StatusError) throw error;

    if (error instanceof Error) {
      throw new StatusError(error.message, 500);
    }

    throw new StatusError('An unexpected error occurred', 500);
  }
}
