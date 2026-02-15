"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { toast } from "sonner";
import {
  Wallet,
  User,
  Loader2,
  Copy,
  ExternalLink,
  Power,
  ChevronDown,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { fetchWalletUsdcBalance } from "@/lib/wallet-balance";

export default function WalletButton() {
  const { user, connectWallet, disconnectWallet, setWalletStatus, setBalance } = useStore();
  const { login, logout, status } = useAuth();
  const { wallet } = useWallet();
  const { isConnected, walletAddress, balance } = user;

  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeWalletAddress = walletAddress ?? wallet?.address ?? null;

  useEffect(() => {
    setWalletStatus(status ?? null);
  }, [setWalletStatus, status]);

  useEffect(() => {
    if (wallet?.address) {
      connectWallet(
        wallet.address,
        wallet.owner ?? null,
        status ?? "logged-in",
      );
      return;
    }

    if (status === "logged-out") {
      disconnectWallet();
    }
  }, [connectWallet, disconnectWallet, status, wallet?.address, wallet?.owner]);

  const refreshWalletBalance = useCallback(async () => {
    if (!wallet?.address || status === "logged-out") {
      return;
    }

    try {
      const usdc = await fetchWalletUsdcBalance(wallet);
      setBalance(usdc);
    } catch (error) {
      console.error("Failed to fetch wallet balance", error);
    }
  }, [setBalance, status, wallet]);

  useEffect(() => {
    void refreshWalletBalance();
  }, [refreshWalletBalance]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void refreshWalletBalance();
  }, [isOpen, refreshWalletBalance]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      await login();
      toast.success("Crossmint login iniciado");
    } catch {
      toast.error("No se pudo iniciar el login");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      disconnectWallet();
      setIsOpen(false);
      toast.info("Wallet desconectada");
    } catch {
      toast.error("No se pudo cerrar la sesion");
    }
  };

  const handleCopyAddress = async () => {
    if (!activeWalletAddress) {
      toast.error("No wallet address available");
      return;
    }

    await navigator.clipboard.writeText(activeWalletAddress);
    toast.success("Direccion copiada");
    setIsOpen(false);
  };

  const handleOpenExplorer = () => {
    if (!activeWalletAddress) {
      toast.error("No wallet address available");
      return;
    }

    window.open(
      `https://stellar.expert/explorer/testnet/account/${activeWalletAddress}`,
      "_blank",
    );
    setIsOpen(false);
  };

  const formattedBalance = balance.usdc.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // --- Disconnected ---
  if (!isConnected) {
    const isAuthLoading = status === "initializing" || isConnecting;

    return (
      <button
        disabled={isAuthLoading}
        onClick={handleConnect}
        className="flex items-center gap-2 rounded-lg bg-magenta px-4 py-2 font-sans text-sm font-semibold text-white transition-all duration-200 hover:bg-magenta-600 active:scale-[0.97] disabled:opacity-70"
      >
        {isAuthLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <Wallet className="size-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  // --- Connected ---

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 font-sans text-sm transition-all duration-200 hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-fuchsia-500 text-white ring-1 ring-fuchsia-200">
          <User className="size-3.5" strokeWidth={2.25} aria-hidden />
        </span>
        <span className="font-medium text-gray-700">Account</span>
        <ChevronDown
          className={`size-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl border border-gray-100 bg-white shadow-lg">
          {/* Network badge */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <span className="inline-flex size-2 rounded-full bg-emerald-400" />
            <span className="font-sans text-sm font-medium text-gray-700">
              Stellar Testnet
            </span>
          </div>

          {/* Balance section */}
          <div className="border-b border-gray-100 px-4 py-4">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Balance available
            </p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight text-gray-900">
              ${formattedBalance}
            </p>
            <p className="font-mono text-xs text-gray-500">
              ≈ {formattedBalance} USDC
            </p>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={handleCopyAddress}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-sans text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Copy className="size-4 text-gray-400" />
              Copiar direccion
            </button>

            <button
              onClick={handleOpenExplorer}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-sans text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ExternalLink className="size-4 text-gray-400" />
              Ver en Explorer
            </button>

            <div className="my-1 border-t border-gray-100" />

            <button
              onClick={handleDisconnect}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-sans text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <Power className="size-4" />
              Desconectar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
