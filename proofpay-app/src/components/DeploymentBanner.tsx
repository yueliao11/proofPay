"use client";

import deployment from "@/lib/deployment.json";
import { HashDisplay } from "./HashDisplay";
import { Globe } from "lucide-react";

export function DeploymentBanner() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-2 text-sm">
      <Globe className="size-4 shrink-0 text-[#22C55E]" />
      <span className="text-[#F8FAFC]">
        Live on <span className="font-semibold text-[#22C55E]">Sui Testnet</span>
      </span>
      <span className="hidden text-[#94A3B8] sm:inline">·</span>
      <span className="hidden text-[#94A3B8] sm:inline">
        Package <HashDisplay hash={deployment.packageId} />
      </span>
    </div>
  );
}
