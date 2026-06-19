"use client";

import { AgentWorkSettlement, SettlementStatus } from "@/lib/types";
import { Check, Clock, XCircle, FileCheck, BadgeCheck, Wallet, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const nodes: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "created", label: "Settlement Created", icon: FileCheck },
  { id: "locked", label: "Payment Locked", icon: Wallet },
  { id: "submitted", label: "Agent Delivery Submitted", icon: FileCheck },
  { id: "reviewed", label: "AI Review Completed", icon: BadgeCheck },
  { id: "passport", label: "TraceBrief Passport Updated", icon: FileCheck },
  { id: "released", label: "Payment Released", icon: Wallet },
  { id: "reputation", label: "Agent Reputation Updated", icon: Trophy },
];

function statusIndex(status: SettlementStatus): number {
  switch (status) {
    case "funded":
      return 1;
    case "submitted":
      return 2;
    case "needs_revision":
      return 3;
    case "reviewed":
      return 5;
    case "released":
      return 6;
    default:
      return 0;
  }
}

export function SettlementTimeline({ settlement }: { settlement: AgentWorkSettlement }) {
  const activeIndex = statusIndex(settlement.status);

  return (
    <div className="rounded-2xl border border-[#263244] bg-[#172033] p-5">
      <h3 className="mb-5 text-base font-semibold text-[#F8FAFC]">Settlement Timeline</h3>
      <div className="relative">
        <div className="absolute top-4 left-4 h-[calc(100%-2rem)] w-px bg-[#263244]" />
        <ul className="relative space-y-5">
          {nodes.map((node, index) => {
            const isActive = index <= activeIndex;
            const isCurrent = index === activeIndex;
            const Icon = node.icon;

            let state: "complete" | "current" | "pending" = "pending";
            if (isActive && !isCurrent) state = "complete";
            else if (isCurrent) state = "current";

            // AI review node special handling for needs_revision
            const isFailedReview = node.id === "reviewed" && settlement.status === "needs_revision";

            return (
              <li key={node.id} className="flex items-start gap-4">
                <div
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                    state === "complete" && "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]",
                    state === "current" && isFailedReview && "border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]",
                    state === "current" && !isFailedReview && "border-[#4DA3FF] bg-[#4DA3FF]/10 text-[#4DA3FF]",
                    state === "pending" && "border-[#263244] bg-[#111827] text-[#94A3B8]"
                  )}
                >
                  {state === "complete" ? (
                    <Check className="size-4" />
                  ) : isFailedReview ? (
                    <XCircle className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>
                <div className="flex flex-col pt-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      state === "pending" ? "text-[#94A3B8]" : "text-[#F8FAFC]"
                    )}
                  >
                    {node.label}
                  </span>
                  {state === "current" && (
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-[#94A3B8]">
                      <Clock className="size-3" />
                      Current status
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
