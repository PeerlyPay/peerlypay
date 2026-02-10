'use client';

import { useState } from 'react';
import { Zap, TrendingUp } from 'lucide-react';

export type UserRole = 'FREELANCER' | 'MARKET_MAKER';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const [selected, setSelected] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-bold text-3xl">¿Cómo vas a usar PeerlyPay?</h1>
          <p className="text-gray-600">
            Elige tu perfil para personalizar tu experiencia
          </p>
        </div>

        <div className="space-y-4">
          {/* Freelancer */}
          <div 
            className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
              selected === 'FREELANCER' 
                ? 'border-pink-500 bg-pink-50 shadow-lg' 
                : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
            }`}
            onClick={() => setSelected('FREELANCER')}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selected === 'FREELANCER' ? 'bg-pink-200' : 'bg-pink-100'
              }`}>
                <Zap className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Cobro en crypto, necesito pesos
                </h3>
                <p className="text-sm text-gray-600">
                  Conversión rápida de USDC a moneda local
                </p>
              </div>
            </div>
          </div>

          {/* Market Maker */}
          <div 
            className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
              selected === 'MARKET_MAKER' 
                ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
            }`}
            onClick={() => setSelected('MARKET_MAKER')}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selected === 'MARKET_MAKER' ? 'bg-indigo-200' : 'bg-indigo-100'
              }`}>
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Quiero proveer liquidez y ganar
                </h3>
                <p className="text-sm text-gray-600">
                  Compra/venta activa de USDC
                </p>
              </div>
            </div>
          </div>
        </div>

        <button 
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
            selected
              ? 'bg-pink-600 text-white hover:bg-pink-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!selected}
          onClick={() => selected && onSelectRole(selected)}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}