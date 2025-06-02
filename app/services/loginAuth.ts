import { StatusError } from '../types/error';

export async function loginFetcher(
  url: string,
  { arg }: { arg: { email: string; password: string } }
) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(arg),
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
