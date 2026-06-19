"use client";

import Link from "next/link";
import { ConnectButton, useWallets } from "@mysten/dapp-kit";
import { ShieldCheck, Wallet } from "lucide-react";

const links = [
  { href: "/create", label: "Create Settlement" },
  { href: "/demo", label: "Demo Console" },
  { href: "/verify", label: "Verify Passport" },
];

function WalletConnect() {
  const wallets = useWallets();

  if (wallets.length === 0) {
    return (
      <a
        href="https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmafojhmhfhmflbh"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border border-[#263244] bg-[#172033] px-3 py-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC]"
      >
        <Wallet className="size-4" />
        Install Sui Wallet
      </a>
    );
  }

  return <ConnectButton connectText="Connect Wallet" />;
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#263244] bg-[#0B1020]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4DA3FF] to-[#8B5CF6]">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-tight text-[#F8FAFC]">ProofPay</span>
            <span className="text-[11px] leading-tight text-[#94A3B8]">Settlement layer for AI agent work.</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[#172033] hover:text-[#F8FAFC]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <WalletConnect />
          </div>
          <div className="sm:hidden">
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}
