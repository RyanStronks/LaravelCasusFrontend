'use client';

import { useAuth } from '@/app/components/auth/AuthContext';
import { baseFetcher } from '@/app/services/baseFetcher';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import Loading from '../../loading';

type Game = {
  id: number;
  name: string;
  description: string;
  image_path: string;
};

const createGame = async (
  data: { name: string; description: string; image_path: string },
  token: string
) => {
  return baseFetcher(`${process.env.NEXT_PUBLIC_API_URL}/games`, {
    method: 'POST',
    token,
    body: data,
  });
};

const deleteGame = async (gameId: number, token: string) => {
  await baseFetcher(`${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}`, {
    method: 'DELETE',
    token,
  });
};

const uploadImage = async (file: File, token: string): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const data = await baseFetcher(
    `${process.env.NEXT_PUBLIC_API_URL}/upload-image`,
    {
      method: 'POST',
      token,
      body: formData,
    }
  );
  return data.path;
};

export default function GameManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const { token } = useAuth();

  const { data: games = [], isLoading } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_API_URL}/games`, token] : null,
    ([url, token]) => baseFetcher(url, { token }),
    {
      dedupingInterval: 24 * 60 * 60 * 1000,
    }
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setCreateError(null);
    try {
      let imagePath = '';
      if (newImageFile) {
        imagePath = await uploadImage(newImageFile, token);
      }
      await createGame(
        {
          name: newName,
          description: newDescription,
          image_path: imagePath,
        },
        token
      );
      setShowCreateModal(false);
      setNewName('');
      setNewDescription('');
      setNewImageFile(null);
      globalMutate([`${process.env.NEXT_PUBLIC_API_URL}/games`, token]);
    } catch {
      setCreateError('Failed to create game.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (gameToDelete && token) {
      try {
        await deleteGame(gameToDelete.id, token);
        setShowModal(false);
        setGameToDelete(null);
        globalMutate([`${process.env.NEXT_PUBLIC_API_URL}/games`, token]);
      } catch {
        setShowModal(false);
        setGameToDelete(null);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className='max-w-2xl mx-auto p-8 rounded-xl shadow-lg bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a192f] text-zinc-100'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-purple-900 dark:text-purple-600'>
          Games
        </h1>
        <button
          className='px-4 py-2 rounded bg-purple-700 dark:bg-purple-500 text-white hover:bg-purple-800 cursor-pointer'
          onClick={() => setShowCreateModal(true)}
        >
          + Create Game
        </button>
      </div>
      <ul className='space-y-4'>
        {games.map((game: Game) => (
          <li
            key={game.id}
            className='p-4 rounded-lg bg-[#1e293b] hover:bg-[#334155] transition-colors border border-[#22304a]'
          >
            <div className='flex items-center justify-between'>
              <div>
                <Link href={`/gamemanagement/${game.id}`}>
                  <span className='font-semibold text-purple-700 dark:text-purple-400 cursor-pointer hover:underline'>
                    {game.name}
                  </span>
                </Link>
                <span className='ml-2 text-zinc-400'>({game.description})</span>
                {game.image_path && (
                  <div className='mt-2'>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${game.image_path}`}
                      alt={game.name}
                      width={64}
                      height={64}
                      className='h-16 w-auto rounded object-cover cursor-pointer'
                      unoptimized
                      onClick={() => {
                        setSelectedGame(game);
                        setShowImageModal(true);
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <FontAwesomeIcon
                  icon={faTrashCan}
                  className='cursor-pointer text-red-400 hover:text-red-600'
                  onClick={() => {
                    setGameToDelete(game);
                    setShowModal(true);
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showCreateModal && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <div className='bg-[#1e293b] p-6 rounded-lg shadow-lg text-center w-full max-w-md'>
            <h2 className='text-xl font-bold text-purple-900 dark:text-purple-600 mb-2'>
              Create Game
            </h2>
            {createError && (
              <div className='mb-2 text-red-400'>{createError}</div>
            )}
            <form onSubmit={handleCreate} className='space-y-4'>
              <input
                className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition'
                placeholder='Name'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <input
                className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition'
                placeholder='Description'
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
              />
              <input
                type='file'
                accept='image/*'
                className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition'
                onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
              />
              <div className='flex justify-center gap-4 mt-4'>
                <button
                  type='submit'
                  className='px-4 py-2 rounded bg-purple-700 dark:bg-purple-500 text-white hover:bg-purple-800 cursor-pointer'
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type='button'
                  className='px-4 py-2 rounded bg-zinc-500 text-white hover:bg-zinc-600 cursor-pointer'
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && gameToDelete && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <div className='bg-[#1e293b] p-6 rounded-lg shadow-lg text-center'>
            <h2 className='text-xl font-bold mb-4 text-blue-200'>
              Are you sure?
            </h2>
            <p className='mb-6 text-zinc-300'>
              Do you really want to delete{' '}
              <span className='font-semibold'>{gameToDelete.name}</span>?
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
                  setGameToDelete(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedGame && selectedGame.image_path && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm'
          onClick={() => setShowImageModal(false)}
        >
          <div className='relative p-4 flex flex-col items-center h-2/3 w-2/3'>
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${selectedGame.image_path}`}
              alt={selectedGame.name}
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
