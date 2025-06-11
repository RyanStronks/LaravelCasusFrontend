'use client';

import { baseFetcher } from '@/app/services/baseFetcher';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const data = await baseFetcher(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        {
          method: 'POST',
          body: { email, password },
        }
      );
      localStorage.setItem('token', data.token);

      toast.success('Login successful!');
      router.push('/');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('Login failed');
      }
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-[#722AE6] to-[#E4B5CB] dark:from-black dark:to-[#923CB5] transition-colors duration-300'>
      <form
        onSubmit={handleSubmit}
        className='bg-gray-50 dark:bg-gray-800 p-10 rounded-2xl shadow-xl w-full max-w-md border border-purple-400 dark:border-gray-700 transition-colors duration-300'
      >
        <h1 className='text-3xl font-extrabold mb-8 text-center text-purple-700 dark:text-purple-400 tracking-tight'>
          Login
        </h1>
        <div className='space-y-5'>
          <input
            type='email'
            placeholder='Email'
            className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='email'
          />
          <input
            type='password'
            placeholder='Password'
            className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete='current-password'
          />
        </div>
        <button
          type='submit'
          className='mt-7 w-full bg-purple-600 dark:bg-purple-800 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-purple-500 dark:hover:bg-purple-700 transition cursor-pointer'
        >
          Login
        </button>
        <div className='mt-6 text-center'>
          <a
            href='/register'
            className='text-purple-600 dark:text-purple-400 hover:underline font-medium transition'
          >
            Don&apos;t have an account? Register
          </a>
        </div>
      </form>
    </div>
  );
}
