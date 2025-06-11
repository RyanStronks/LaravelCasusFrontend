'use client';

import { useAuth } from '@/app/components/auth/AuthContext';
import Loading from '@/app/loading';
import { baseFetcher } from '@/app/services/baseFetcher';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate as globalMutate } from 'swr';

const updateGame = async (
  id: string,
  token: string,
  data: { name: string; description: string }
) => {
  return baseFetcher(`${process.env.NEXT_PUBLIC_API_URL}/games/${id}`, {
    method: 'PUT',
    token,
    body: data,
  });
};

const deleteGame = async (id: string, token: string) => {
  await baseFetcher(`${process.env.NEXT_PUBLIC_API_URL}/games/${id}`, {
    method: 'DELETE',
    token,
  });
};

export default function GameDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    data: game,
    isLoading,
    mutate,
  } = useSWR(
    token && id
      ? [`${process.env.NEXT_PUBLIC_API_URL}/games/${id}`, token]
      : null,
    ([url, token]: [string, string]) => baseFetcher(url, { token }),
    {
      dedupingInterval: 24 * 60 * 60 * 1000,
    }
  );

  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (game) {
      setEditName(game.name);
      setEditDescription(game.description);
    }
  }, [game]);

  const handleDelete = async () => {
    if (!token || !id) return;
    try {
      await deleteGame(id, token);
      globalMutate([`${process.env.NEXT_PUBLIC_API_URL}/games`, token]);
      router.push('/gamemanagement');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('Delete failed');
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    setSaving(true);
    setError(null);
    try {
      await updateGame(id, token, {
        name: editName,
        description: editDescription,
      });
      setEditMode(false);
      mutate(undefined, true);
      globalMutate([`${process.env.NEXT_PUBLIC_API_URL}/games`, token]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('Update failed');
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  if (!game)
    return (
      <div className='text-center mt-10 text-red-400'>Game not found.</div>
    );

  return (
    <div className='max-w-2xl mx-auto p-8 rounded-xl shadow-lg bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a192f] text-zinc-100'>
      {error && <div className='mb-4 text-red-400'>{error}</div>}
      <div className='p-4 rounded-lg bg-[#1e293b] border border-[#22304a] mb-4'>
        {editMode ? (
          <form onSubmit={handleUpdate} className='space-y-4'>
            <div className='flex flex-col md:flex-row gap-6 items-start'>
              <div className='flex-1 w-full'>
                <label className='block mb-1 text-purple-700 dark:text-purple-400'>
                  Name
                </label>
                <input
                  className='w-full p-2 rounded bg-[#0f172a] text-zinc-100'
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <label className='block mb-1 mt-4 text-purple-700 dark:text-purple-400'>
                  Description
                </label>
                <textarea
                  className='w-full p-2 rounded bg-[#0f172a] text-zinc-100'
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                />
              </div>
              {game.image_path && (
                <div
                  className='flex-shrink-0 cursor-pointer md:ml-6 mt-4 md:mt-0'
                  onClick={() => setShowImageModal(true)}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${game.image_path}`}
                    alt={game.name}
                    width={96}
                    height={96}
                    className='h-24 w-24 rounded object-cover border border-zinc-700'
                    unoptimized
                  />
                  <div className='text-xs text-zinc-400 text-center mt-1'>
                    Click to enlarge
                  </div>
                </div>
              )}
            </div>
            <div className='flex gap-2 mt-4'>
              <button
                type='submit'
                className='px-4 py-2 rounded bg-purple-700 dark:bg-purple-500 text-white hover:bg-purple-800 cursor-pointer'
                disabled={saving}
              >
                Save
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
          <div className='flex flex-col md:flex-row gap-6 items-start'>
            <div className='flex-1 w-full'>
              <div className='font-semibold text-purple-700 dark:text-purple-400 text-xl mb-2'>
                {game.name}
              </div>
              <div className='text-zinc-400 mb-2'>{game.description}</div>
              <div className='flex gap-2 mt-4'>
                <button
                  className='px-4 py-2 rounded bg-purple-700 dark:bg-purple-500 text-white hover:bg-purple-800 cursor-pointer'
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>
                <button
                  className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
            {game.image_path && (
              <div
                className='flex-shrink-0 cursor-pointer md:ml-6 mt-4 md:mt-0'
                onClick={() => setShowImageModal(true)}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${game.image_path}`}
                  alt={game.name}
                  width={96}
                  height={96}
                  className='h-24 w-24 rounded object-cover border border-zinc-700 mb-2'
                  unoptimized
                />
                <div className='text-xs text-zinc-400 text-center'>
                  Click to enlarge
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showImageModal && game.image_path && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm'
          onClick={() => setShowImageModal(false)}
        >
          <div className='relative p-4 flex flex-col items-center h-2/3 w-2/3'>
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${game.image_path}`}
              alt={game.name}
              width={600}
              height={600}
              className='h-full w-auto max-w-full max-h-full rounded mb-4 object-contain'
              unoptimized
              onClick={(e) => e.stopPropagation()}
            />
            <div className='text-xs text-zinc-400 text-center'>
              Click outside to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
