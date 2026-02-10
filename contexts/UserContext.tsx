'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'FREELANCER' | 'MARKET_MAKER';

export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  createdAt: Date;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isFreelancer: boolean;
  isMarketMaker: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'peerlypay_user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserState(parsed);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    
    try {
      if (newUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const isFreelancer = user?.role === 'FREELANCER';
  const isMarketMaker = user?.role === 'MARKET_MAKER';

  return (
    <UserContext.Provider 
      value={{ user, setUser, isFreelancer, isMarketMaker, loading }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}