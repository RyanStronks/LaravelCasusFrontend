'use client';

import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Loading from '../loading';

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

const deleteUser = async (userId: number, token: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  );
  if (!res.ok) {
    const error: StatusError = new Error('Failed to delete user');
    error.status = res.status;
    throw error;
  }
};

export default function UserManagement() {
  const [token, setToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkToken = () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        router.replace('/login');
      } else {
        setToken(storedToken);
      }
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
    mutate,
  } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_API_URL}/users`, token] : null,
    ([url, token]) => fetcher(url, token),
    {
      dedupingInterval: 24 * 60 * 60 * 1000,
    }
  );

  const handleDelete = async () => {
    if (userToDelete && token) {
      try {
        await deleteUser(userToDelete.id, token);
        setShowModal(false);
        setUserToDelete(null);
        mutate();
      } catch {
        setShowModal(false);
        setUserToDelete(null);
      }
    }
  };

  useEffect(() => {
    const status = error && (error as StatusError).status;
    if (status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [error, router]);

  if (isLoading) return <Loading />;

  return (
    <div className='max-w-2xl mx-auto mt-10 p-8 rounded-xl shadow-lg bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a192f] text-zinc-100'>
      <h1 className='text-3xl font-bold mb-6 text-blue-300'>Users</h1>
      <ul className='space-y-4'>
        {users.map((user: User) => (
          <li
            key={user.id}
            className='p-4 rounded-lg bg-[#1e293b] hover:bg-[#334155] transition-colors border border-[#22304a]'
          >
            <div className='flex items-center justify-between'>
              <div>
                <Link href={`/usermanagement/${user.id}`}>
                  <span className='font-semibold text-blue-200 cursor-pointer hover:underline'>
                    {user.name}
                  </span>
                </Link>
                <span className='ml-2 text-zinc-400'>({user.email})</span>
              </div>
              <div>
                <FontAwesomeIcon
                  icon={faTrashCan}
                  className='cursor-pointer text-red-400 hover:text-red-600'
                  onClick={() => {
                    setUserToDelete(user);
                    setShowModal(true);
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showModal && userToDelete && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <div className='bg-[#1e293b] p-6 rounded-lg shadow-lg text-center'>
            <h2 className='text-xl font-bold mb-4 text-blue-200'>
              Are you sure?
            </h2>
            <p className='mb-6 text-zinc-300'>
              Do you really want to delete{' '}
              <span className='font-semibold'>{userToDelete.name}</span>?
            </p>
            <div className='flex justify-center gap-4'>
              <button
                className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700'
                onClick={handleDelete}
              >
                Yes, Delete
              </button>
              <button
                className='px-4 py-2 rounded bg-zinc-500 text-white hover:bg-zinc-600'
                onClick={() => {
                  setShowModal(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
