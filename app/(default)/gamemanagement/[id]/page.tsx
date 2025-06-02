'use client';

import { useAuth } from '@/app/components/auth/AuthContext';
import Loading from '@/app/loading';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

export default function GameDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const id = params?.id as string;

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

  const { data: game = [], isLoading } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_API_URL}/games/${id}`, token] : null,
    ([url, token]) => fetcher(url, token),
    {
      dedupingInterval: 24 * 60 * 60 * 1000,
    }
  );

  if (isLoading) return <Loading />;

  if (!game) {
    return <div className='text-center mt-10 text-red-400'>Game not found</div>;
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a192f]'>
      <div className='max-w-2xl w-full bg-[#1e293b] rounded-xl shadow-lg p-8 text-zinc-100 border border-[#22304a]'>
        <div className='flex flex-col md:flex-row gap-8 items-center'>
          <div className='w-64 h-64 relative'>
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${game.image_path}`}
              alt={game.name}
              width={64}
              height={64}
              className='h-16 w-auto rounded object-cover'
              unoptimized
            />
          </div>
          <div className='flex-1'>
            <h1 className='text-4xl font-bold mb-4 text-blue-300'>
              {game.name}
            </h1>
            <p className='text-lg text-zinc-300 mb-6'>{game.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
