'use client';

import { createContext, useContext } from 'react';

export const AuthContext = createContext<{ token: string | null }>({
  token: null,
});

export const useAuth = () => useContext(AuthContext);
