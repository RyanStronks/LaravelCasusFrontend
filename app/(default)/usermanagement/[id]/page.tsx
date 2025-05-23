'use client';

import { useAuth } from '@/app/components/AuthContext';
import Loading from '@/app/loading';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';

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

const deleteUser = async (id: string, token: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error('Failed to delete user');
  }
};

const updateUser = async (
  id: string,
  token: string,
  data: { name: string; email: string }
) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to update user');
  }
  return res.json();
};

export default function UserDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    data: user,
    isLoading,
    mutate,
  } = useSWR(
    token && id
      ? [`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, token]
      : null,
    ([url, token]) => fetcher(url, token),
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
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
      ) {
        setError((err as { message: string }).message);
      } else {
        setError('Failed to delete user.');
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
      mutate();
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
      ) {
        setError((err as { message: string }).message);
      } else {
        setError('Failed to update user.');
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
    <div className='max-w-2xl mx-auto mt-10 p-8 rounded-xl shadow-lg bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a192f] text-zinc-100'>
      <h1 className='text-3xl font-bold mb-6 text-blue-300'>User Detail</h1>
      {error && <div className='mb-4 text-red-400'>{error}</div>}
      <div className='p-4 rounded-lg bg-[#1e293b] border border-[#22304a] mb-4'>
        {editMode ? (
          <form onSubmit={handleUpdate} className='space-y-4'>
            <div>
              <label className='block mb-1 text-blue-200'>Name</label>
              <input
                className='w-full p-2 rounded bg-[#0f172a] text-zinc-100'
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className='block mb-1 text-blue-200'>Email</label>
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
                className='px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700'
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type='button'
                className='px-4 py-2 rounded bg-zinc-500 text-white hover:bg-zinc-600'
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className='font-semibold text-blue-200'>{user.name}</div>
            <div className='text-zinc-400'>{user.email}</div>
            <div className='text-zinc-400'>ID: {user.id}</div>
            <div className='flex gap-2 mt-4'>
              <button
                className='px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700'
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
              <button
                className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700'
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
