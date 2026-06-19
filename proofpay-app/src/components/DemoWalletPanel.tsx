"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import deployment from "@/lib/deployment.json";
import { Wallet, Unlink, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "proofpay_demo_wallet_connected";

export function useDemoWallet() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setConnected(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const connect = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setConnected(true);
  };

  const disconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConnected(false);
  };

  return { connected, address: deployment.deployer, connect, disconnect };
}

export function DemoWalletPanel({
  connected,
  onConnect,
  onDisconnect,
  className,
}: {
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  className?: string;
}) {
  const address = deployment.deployer;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-2 text-sm transition-colors",
        connected
          ? "border-[#22C55E]/30 bg-[#22C55E]/10"
          : "border-[#263244] bg-[#172033]",
        className
      )}
    >
      {connected ? (
        <>
          <CheckCircle2 className="size-4 shrink-0 text-[#22C55E]" />
          <div className="flex flex-col leading-tight">
            <span className="font-medium text-[#F8FAFC]">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="text-[11px] text-[#94A3B8]">Sui Testnet · Demo Wallet</span>
          </div>
          <button
            onClick={onDisconnect}
            className="ml-2 rounded-md p-1 text-[#94A3B8] hover:bg-[#22C55E]/10 hover:text-[#22C55E]"
            aria-label="Disconnect demo wallet"
          >
            <Unlink className="size-3.5" />
          </button>
        </>
      ) : (
        <>
          <Wallet className="size-4 shrink-0 text-[#4DA3FF]" />
          <span className="text-[#94A3B8]">No wallet connected</span>
          <Button
            size="sm"
            onClick={onConnect}
            className="ml-2 h-7 rounded-lg bg-[#4DA3FF] px-3 text-xs font-semibold text-[#0B1020] hover:bg-[#4DA3FF]/90"
          >
            Connect Demo Wallet
          </Button>
        </>
      )}
    </div>
  );
}
