import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
      <Toaster position='top-right' />
      <nav className='flex items-center justify-between px-8 py-4 border-b border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800'>
        <div className='font-bold text-xl tracking-tight'>Laravel Casus</div>
        <div className='flex gap-6'>
          <Link
            href='/'
            className='no-underline text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
          >
            Home
          </Link>
          <Link
            href='/gamemanagement'
            className='no-underline text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
          >
            Game Management
          </Link>
          <Link
            href='/usermanagement'
            className='no-underline text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
          >
            User Management
          </Link>
        </div>
      </nav>
      <main
        className='bg-gradient-to-br from-[#722AE6] to-[#E4B5CB] dark:from-black dark:to-[#923CB5] min-h-screen py-10'
        style={{ minHeight: 'calc(100vh - 61px)' }}
      >
        {children}
      </main>
    </AuthWrapper>
  );
}
