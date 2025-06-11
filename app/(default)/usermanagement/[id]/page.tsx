'use client';

import { useAuth } from '@/app/components/auth/AuthContext';
import Loading from '@/app/loading';
import { baseFetcher } from '@/app/services/baseFetcher';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate as globalMutate } from 'swr';

const updateUser = async (
  id: string,
  token: string,
  data: { name: string; email: string }
) => {
  return baseFetcher(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    method: 'PUT',
    token,
    body: data,
  });
};

const deleteUser = async (id: string, token: string) => {
  await baseFetcher(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    method: 'DELETE',
    token,
  });
};

export default function UserDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: user, isLoading } = useSWR(
    token && id
      ? [`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, token]
      : null,
    ([url, token]) => baseFetcher(url, { token }),
    {
      dedupingInterval: 24 * 60 * 60 * 1000,
    }
  );

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  const handleDelete = async () => {
    if (!token || !id) return;
    try {
      await deleteUser(id, token);
      router.push('/usermanagement');
      globalMutate([`${process.env.NEXT_PUBLIC_API_URL}/users`, token]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('Registration failed');
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    setSaving(true);
    setError(null);
    try {
      await updateUser(id, token, { name: editName, email: editEmail });
      setEditMode(false);
      globalMutate([`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, token]);
      globalMutate([`${process.env.NEXT_PUBLIC_API_URL}/users`, token]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  if (!user)
    return (
      <div className='text-center mt-10 text-red-400'>User not found.</div>
    );

  return (
    <div className='max-w-2xl mx-auto p-8 rounded-xl shadow-lg bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a192f] text-zinc-100'>
      {error && <div className='mb-4 text-red-400'>{error}</div>}
      <div className='p-4 rounded-lg bg-[#1e293b] border border-[#22304a] mb-4'>
        {editMode ? (
          <form onSubmit={handleUpdate} className='space-y-4'>
            <div>
              <label className='block mb-1 text-purple-700 dark:text-purple-400'>
                Name
              </label>
              <input
                className='w-full p-2 rounded bg-[#0f172a] text-zinc-100'
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className='block mb-1 text-purple-700 dark:text-purple-400'>
                Email
              </label>
              <input
                className='w-full p-2 rounded bg-[#0f172a] text-zinc-100'
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            <div className='flex gap-2'>
              <button
                type='submit'
                className='px-4 py-2 rounded bg-purple-700 dark:bg-purple-500 text-white hover:bg-purple-800 cursor-pointer'
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type='button'
                className='px-4 py-2 rounded bg-zinc-500 text-white hover:bg-zinc-600 cursor-pointer'
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className='font-semibold text-purple-700 dark:text-purple-400'>
              {user.name}
            </div>
            <div className='text-zinc-400'>{user.email}</div>
            <div className='text-zinc-400'>ID: {user.id}</div>
            <div className='flex gap-2 mt-4'>
              <button
                className='px-4 py-2 rounded bg-purple-700 dark:bg-purple-500 text-white hover:bg-purple-800 cursor-pointer'
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
              <button
                className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer  '
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
