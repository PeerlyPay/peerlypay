"use client";

import { useState } from "react";
import { useAuth } from "@crossmint/client-sdk-react-ui";
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { useBalance } from "@/contexts/BalanceContext";
import WalletModal from "@/components/WalletModal";
import DepositModal from "@/components/DepositModal";
import TradeDrawer from "@/components/TradeDrawer";
import SendModal from "@/components/SendModal";

const actions = [
  { icon: ArrowUpFromLine, label: "Send", id: "send" },
  { icon: ArrowDownToLine, label: "Receive", id: "receive" },
  { icon: TrendingUp, label: "Buy", id: "buy" },
  { icon: TrendingDown, label: "Sell", id: "sell" },
] as const;

export default function QuickActions() {
  const { user, disconnectWallet } = useStore();
  const { logout } = useAuth();
  const { usdc, subtractBalance } = useBalance();
  const [depositOpen, setDepositOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [sendOpen, setSendOpen] = useState(false);
  const walletAddress = user.walletAddress ?? "";

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch {}

    disconnectWallet();
  };

  const handleAction = (id: string) => {
    switch (id) {
      case "send":
        setSendOpen(true);
        break;
      case "receive":
        setDepositOpen(true);
        break;
      case "buy":
        setTradeMode("buy");
        setTradeOpen(true);
        break;
      case "sell":
        setTradeMode("sell");
        setTradeOpen(true);
        break;
      default:
        toast.info(`${id.charAt(0).toUpperCase() + id.slice(1)} coming soon`);
    }
  };

  return (
    <>
      <div className="mt-6 flex gap-2">
        {actions.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => handleAction(id)}
            className="flex h-[71px] flex-1 flex-col items-center justify-center gap-1 rounded-[14px] border border-primary-500 bg-white transition-colors hover:bg-primary-50"
          >
            <Icon className="size-6 text-primary-500" strokeWidth={1.5} />
            <span className="text-[12px] font-medium leading-5 text-[#4a5464]">
              {label}
            </span>
          </button>
        ))}
      </div>

      <SendModal
        isOpen={sendOpen}
        onClose={() => setSendOpen(false)}
        availableUsdc={usdc}
        onSend={(amount) => subtractBalance(amount)}
      />

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        walletAddress={walletAddress}
      />

      <TradeDrawer
        open={tradeOpen}
        onOpenChange={setTradeOpen}
        mode={tradeMode}
      />
    </>
  );
}
