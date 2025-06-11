'use client';

import { useAuth } from '@/app/components/auth/AuthContext';
import { baseFetcher } from '@/app/services/baseFetcher';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import Loading from '../../loading';

type User = {
  id: number;
  name: string;
  email: string;
};

const deleteUser = async (userId: number, token: string) => {
  await baseFetcher(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
    method: 'DELETE',
    token,
  });
};

export default function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { token } = useAuth();

  const { data: users = [], isLoading } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_API_URL}/users`, token] : null,
    ([url, token]) => baseFetcher(url, { token }),
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
        globalMutate([`${process.env.NEXT_PUBLIC_API_URL}/users`, token]);
      } catch {
        setShowModal(false);
        setUserToDelete(null);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className='max-w-2xl mx-auto p-8 rounded-xl shadow-lg bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a192f] text-zinc-100'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-purple-900 dark:text-purple-600'>
          Users
        </h1>
      </div>
      <ul className='space-y-4'>
        {users.map((user: User) => (
          <li
            key={user.id}
            className='p-4 rounded-lg bg-[#1e293b] hover:bg-[#334155] transition-colors border border-[#22304a]'
          >
            <div className='flex items-center justify-between'>
              <div>
                <Link href={`/usermanagement/${user.id}`}>
                  <span className='font-semibold text-purple-700 dark:text-purple-400 cursor-pointer hover:underline'>
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
            <h2 className='text-xl font-bold mb-4 text-purple-700 dark:text-purple-400'>
              Are you sure?
            </h2>
            <p className='mb-6 text-zinc-300'>
              Do you really want to delete{' '}
              <span className='font-semibold'>{userToDelete.name}</span>?
            </p>
            <div className='flex justify-center gap-4'>
              <button
                className='px-4 py-2 rounded bg-purple-700 dark:bg-purple-500 text-white hover:bg-red-600 cursor-pointer'
                onClick={handleDelete}
              >
                Yes, Delete
              </button>
              <button
                className='px-4 py-2 rounded bg-zinc-500 text-white hover:bg-zinc-600 cursor-pointer'
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
