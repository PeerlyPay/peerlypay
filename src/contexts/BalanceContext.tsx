'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface BalanceContextType {
  usdc: number;
  usd: number;
  addBalance: (amount: number) => void;
  subtractBalance: (amount: number) => boolean;
  getBalance: () => number;
  loading: boolean;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);
const BALANCE_STORAGE_KEY = 'peerlypay_balance';
const DEFAULT_BALANCE = 100; // Demo starting balance

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [usdc, setUsdc] = useState(DEFAULT_BALANCE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BALANCE_STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed)) {
          setUsdc(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((value: number) => {
    try {
      localStorage.setItem(BALANCE_STORAGE_KEY, value.toString());
    } catch (error) {
      console.error('Error saving balance:', error);
    }
  }, []);

  const addBalance = useCallback((amount: number) => {
    setUsdc((prev) => {
      const next = Math.round((prev + amount) * 100) / 100;
      persist(next);
      return next;
    });
  }, [persist]);

  const subtractBalance = useCallback((amount: number): boolean => {
    let success = false;
    setUsdc((prev) => {
      if (prev < amount) return prev;
      const next = Math.round((prev - amount) * 100) / 100;
      persist(next);
      success = true;
      return next;
    });
    return success;
  }, [persist]);

  const getBalance = useCallback(() => usdc, [usdc]);

  // USD is 1:1 with USDC for display
  const usd = usdc;

  return (
    <BalanceContext.Provider value={{ usdc, usd, addBalance, subtractBalance, getBalance, loading }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within BalanceProvider');
  }
  return context;
}
