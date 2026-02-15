'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface CompletedTrade {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  arsReceived: number;
  rate: number;
  date: string;
  marketMaker: string;
  status: 'completed';
  paymentMethod: string;
  txnId: string;
}

interface TradeHistoryContextType {
  trades: CompletedTrade[];
  addTrade: (trade: Omit<CompletedTrade, 'id' | 'date' | 'status'>) => CompletedTrade;
  loading: boolean;
}

const TradeHistoryContext = createContext<TradeHistoryContextType | undefined>(undefined);
const TRADES_STORAGE_KEY = 'peerlypay_trades';

export function TradeHistoryProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<CompletedTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TRADES_STORAGE_KEY);
      if (stored) {
        setTrades(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading trade history:', error);
      localStorage.removeItem(TRADES_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((updated: CompletedTrade[]) => {
    try {
      localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving trade history:', error);
    }
  }, []);

  const addTrade = useCallback((input: Omit<CompletedTrade, 'id' | 'date' | 'status'>): CompletedTrade => {
    const trade: CompletedTrade = {
      ...input,
      id: `TRD-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'completed',
    };
    setTrades((prev) => {
      const updated = [trade, ...prev];
      persist(updated);
      return updated;
    });
    return trade;
  }, [persist]);

  return (
    <TradeHistoryContext.Provider value={{ trades, addTrade, loading }}>
      {children}
    </TradeHistoryContext.Provider>
  );
}

export function useTradeHistory() {
  const context = useContext(TradeHistoryContext);
  if (!context) {
    throw new Error('useTradeHistory must be used within TradeHistoryProvider');
  }
  return context;
}
