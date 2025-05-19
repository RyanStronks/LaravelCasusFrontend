'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        toast.success('Login successful!');
        router.push('/');
      } else {
        let data;
        try {
          data = await res.json();
        } catch {
          data = {};
        }
        if (data?.message === "Email doesn't exist") {
          toast.error("Email doesn't exist. Please register first.");
        } else if (data?.message === 'Password is incorrect') {
          toast.error('Password is incorrect. Please try again.');
        } else {
          toast.error(data?.message || 'Login failed');
        }
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      throw error;
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300'>
      <Toaster position='top-center' />
      <form
        onSubmit={handleSubmit}
        className='bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors duration-300'
      >
        <h1 className='text-3xl font-extrabold mb-8 text-center text-gray-800 dark:text-gray-100 tracking-tight'>
          Login
        </h1>
        <div className='space-y-5'>
          <input
            type='email'
            placeholder='Email'
            className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='email'
          />
          <input
            type='password'
            placeholder='Password'
            className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete='current-password'
          />
        </div>
        <button
          type='submit'
          className='mt-7 w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-blue-900 transition'
        >
          Login
        </button>
        <div className='mt-6 text-center'>
          <a
            href='/register'
            className='text-blue-600 dark:text-blue-400 hover:underline font-medium transition'
          >
            Don&apos;t have an account? Register
          </a>
        </div>
      </form>
    </div>
  );
}
