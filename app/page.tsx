'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Loading from './loading'; // Import your loading component

type User = {
  id: number;
  name: string;
  email: string;
};

type StatusError = Error & { status?: number };

const fetcher = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (res.status === 401) {
    const error: StatusError = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
  return res.json();
};

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkToken = () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        router.replace('/login');
      } else {
        setToken(storedToken);
      }
      setChecked(true);
    };

    checkToken();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkToken();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, [router]);

  const {
    data: users = [],
    error,
    isLoading,
  } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_API_URL}/users`, token] : null,
    ([url, token]) => fetcher(url, token),
    {
      dedupingInterval: 24 * 60 * 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    const status = error && (error as StatusError).status;
    if (status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [error, router]);

  if (!checked) return null;

  if (isLoading) return <Loading />;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user: User) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
