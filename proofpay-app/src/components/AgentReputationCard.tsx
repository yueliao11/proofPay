"use client";

import { AgentReputation } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddressDisplay } from "./AddressDisplay";
import { Star, CheckCircle2, FileBadge, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export function AgentReputationCard({ reputation }: { reputation: AgentReputation }) {
  const scoreColor =
    reputation.latestWorkQualityScore >= 80
      ? "text-[#22C55E]"
      : reputation.latestWorkQualityScore >= 50
      ? "text-[#F59E0B]"
      : "text-[#EF4444]";

  return (
    <Card className="border-[#263244] bg-[#172033]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Star className="size-4 text-[#8B5CF6]" />
          <CardTitle>Agent Reputation</CardTitle>
        </div>
        <CardDescription className="text-[#94A3B8]">On-chain work history for {reputation.agent.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#111827] text-xl font-bold text-[#4DA3FF]">
            {reputation.agent.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-base font-semibold text-[#F8FAFC]">{reputation.agent.name}</div>
            <AddressDisplay address={reputation.agent.address} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#111827] p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-[#94A3B8]">
              <Briefcase className="size-3" />
              Completed
            </div>
            <div className="mt-1 text-xl font-semibold text-[#F8FAFC]">{reputation.completedSettlements}</div>
          </div>
          <div className="rounded-xl bg-[#111827] p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-[#94A3B8]">
              <Star className="size-3" />
              Score
            </div>
            <div className={cn("mt-1 text-xl font-semibold", scoreColor)}>
              {reputation.latestWorkQualityScore}
            </div>
          </div>
          <div className="rounded-xl bg-[#111827] p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-[#94A3B8]">
              <CheckCircle2 className="size-3" />
              Paid
            </div>
            <div className="mt-1 text-xl font-semibold text-[#F8FAFC]">
              {reputation.paymentReleased ? "Yes" : "No"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#263244] bg-[#111827]/50 p-3 text-sm">
          <FileBadge className={cn("size-4 shrink-0", reputation.passportVerified ? "text-[#22C55E]" : "text-[#94A3B8]")} />
          <span className="text-[#94A3B8]">TraceBrief Passport</span>
          <span className={cn("ml-auto text-xs font-medium", reputation.passportVerified ? "text-[#22C55E]" : "text-[#94A3B8]")}>
            {reputation.passportVerified ? "Verified" : "Not verified"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
