'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });

    if (res.ok) {
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } else {
      const data = await res.json();
      toast.error(data.message || 'Registration failed');
    }
    setLoading(false);
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300'>
      <Toaster position='top-center' />
      <form
        onSubmit={handleSubmit}
        className='bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors duration-300'
      >
        <h1 className='text-3xl font-extrabold mb-8 text-center text-gray-800 dark:text-gray-100 tracking-tight'>
          Register
        </h1>
        <div className='space-y-5'>
          <input
            type='text'
            placeholder='Name'
            className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete='name'
          />
          <input
            type='email'
            placeholder='Email'
            className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='email'
          />
          <input
            type='password'
            placeholder='Password'
            className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete='new-password'
          />
          <input
            type='password'
            placeholder='Confirm Password'
            className='w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition'
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            autoComplete='new-password'
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className='mt-7 w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-800 transition disabled:opacity-60'
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className='mt-6 text-center'>
          <a
            href='/login'
            className='text-blue-600 dark:text-blue-400 hover:underline font-medium transition'
          >
            Already have an account? Login
          </a>
        </div>
      </form>
    </div>
  );
}
