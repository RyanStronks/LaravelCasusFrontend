'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  return <>{children}</>;
};

export default AuthWrapper;
