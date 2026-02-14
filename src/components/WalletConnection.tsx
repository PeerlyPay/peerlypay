'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Wallet,
  Loader2,
  LogOut,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(balance: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);
}

export default function WalletConnection() {
  const { user, connectWallet, disconnectWallet } = useStore();
  const { isConnected, walletAddress, balance } = user;
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    isConnected ? 'connected' : 'disconnected'
  );
  const [hasCopied, setHasCopied] = useState(false);

  const handleConnect = useCallback(async () => {
    setConnectionState('connecting');

    try {
      // Simulate wallet connection delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      connectWallet('GDEMO...mock', null, 'logged-in');
      setConnectionState('connected');
      toast.success('Wallet conectada', {
        description: 'Tu wallet está lista para operar',
        icon: <CheckCircle2 className="size-4 text-accent-500" />,
      });
    } catch {
      setConnectionState('error');
      toast.error('Error de conexión', {
        description: 'No se pudo conectar. Intenta de nuevo.',
        icon: <AlertCircle className="size-4" />,
      });
    }
  }, [connectWallet]);

  const handleDisconnect = useCallback(() => {
    disconnectWallet();
    setConnectionState('disconnected');
    toast.info('Wallet desconectada', {
      description: 'Sesión cerrada correctamente',
    });
  }, [disconnectWallet]);

  const handleCopyAddress = useCallback(async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setHasCopied(true);
      toast.success('Dirección copiada');
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar');
    }
  }, [walletAddress]);

  const handleViewExplorer = useCallback(() => {
    if (!walletAddress) return;
    // Stellar explorer URL (placeholder - update with actual explorer)
    const explorerUrl = `https://stellar.expert/explorer/public/account/${walletAddress}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  }, [walletAddress]);

  // Disconnected state - prominent CTA
  if (connectionState === 'disconnected') {
    return (
      <Button
        onClick={handleConnect}
        className="group relative overflow-hidden bg-gradient-peerlypay hover:opacity-90 text-white rounded-full px-5 py-2.5 font-[family-name:var(--font-dm-sans)] font-medium transition-all duration-300 shadow-peerlypay hover:shadow-peerlypay-lg hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Conectar wallet para comenzar a operar"
      >
        {/* Shimmer effect on hover */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <span className="relative flex items-center gap-2">
          <Wallet className="size-4" aria-hidden="true" />
          <span className="hidden xs:inline">Conectar</span>
          <span className="xs:hidden">Wallet</span>
        </span>
      </Button>
    );
  }

  // Connecting state - loading with pulse animation
  if (connectionState === 'connecting') {
    return (
      <Button
        disabled
        className="relative bg-gradient-peerlypay text-white rounded-full px-5 py-2.5 opacity-90 cursor-wait"
        aria-label="Conectando wallet..."
        aria-busy="true"
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full animate-ping bg-primary-500/30" />

        <span className="relative flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span className="text-sm">Conectando...</span>
        </span>
      </Button>
    );
  }

  // Error state - retry option
  if (connectionState === 'error') {
    return (
      <Button
        onClick={handleConnect}
        variant="outline"
        className="border-destructive text-destructive hover:bg-destructive/10 rounded-full px-5 py-2.5 transition-all duration-200"
        aria-label="Error al conectar. Click para reintentar"
      >
        <AlertCircle className="size-4" aria-hidden="true" />
        <span className="text-sm">Reintentar</span>
      </Button>
    );
  }

  // Connected state - rich dropdown with account info
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="group relative rounded-full pl-3 pr-2.5 py-2 h-auto border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200"
          aria-label={`Wallet conectada: ${walletAddress}. Click para ver opciones`}
        >
          {/* Connection indicator dot */}
          <span
            className="absolute -top-0.5 -right-0.5 size-2.5 bg-accent-500 rounded-full border-2 border-white animate-pulse"
            aria-label="Conectado"
          />

          <span className="flex items-center gap-2">
            {/* Mini balance pill */}
            <span className="hidden sm:flex items-center gap-1 bg-neutral-100 rounded-full px-2 py-0.5">
              <Zap className="size-3 text-primary-500" aria-hidden="true" />
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-neutral-700">
                {formatBalance(balance.usd)}
              </span>
            </span>

            {/* Address */}
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-neutral-800">
              {walletAddress ? shortenAddress(walletAddress) : '0x...'}
            </span>

            <ChevronDown
              className="size-4 text-neutral-400 group-hover:text-primary-500 transition-colors"
              aria-hidden="true"
            />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-2 rounded-xl shadow-lg border-neutral-200"
        sideOffset={8}
      >
        {/* Account header */}
        <div className="px-2 py-3 mb-1">
          {/* Network badge */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="size-2 bg-accent-500 rounded-full" aria-hidden="true" />
            <span className="text-xs font-medium text-neutral-500 font-[family-name:var(--font-dm-sans)]">
              Stellar Mainnet
            </span>
          </div>

          {/* Balance display */}
          <div className="flex flex-col">
            <span className="text-overline text-neutral-400 text-[10px]">
              BALANCE DISPONIBLE
            </span>
            <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-neutral-900 tracking-tight">
              {formatBalance(balance.usd)}
            </span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-neutral-500">
              ≈ {balance.usdc.toFixed(2)} USDC
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-neutral-100" />

        {/* Actions */}
        <DropdownMenuItem
          onClick={handleCopyAddress}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-neutral-50 focus:bg-neutral-50 transition-colors"
        >
          {hasCopied ? (
            <CheckCircle2 className="size-4 text-accent-600" aria-hidden="true" />
          ) : (
            <Copy className="size-4 text-neutral-500" aria-hidden="true" />
          )}
          <span className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-700">
            {hasCopied ? 'Copiado' : 'Copiar dirección'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleViewExplorer}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-neutral-50 focus:bg-neutral-50 transition-colors"
        >
          <ExternalLink className="size-4 text-neutral-500" aria-hidden="true" />
          <span className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-700">
            Ver en Explorer
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-neutral-100 my-1" />

        <DropdownMenuItem
          onClick={handleDisconnect}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span className="font-[family-name:var(--font-dm-sans)] text-sm font-medium">
            Desconectar
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
