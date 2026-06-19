"use client";

import { AgentWorkSettlement } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddressDisplay } from "./AddressDisplay";
import { statusLabel, statusColor, formatAmount } from "@/lib/format";
import { Wallet, Lock, Unlock, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PaymentSettlementCard({ settlement }: { settlement: AgentWorkSettlement }) {
  const status = settlement.status;
  const paymentStatus = settlement.paymentStatus;

  let message = "Payment is locked in escrow pending agent delivery.";
  if (status === "submitted") message = "Delivery submitted. Awaiting AI reviewer attestation.";
  if (status === "needs_revision") message = "Review failed. Agent must submit a corrected delivery.";
  if (status === "reviewed") message = "AI review passed. Payment is ready for client release.";
  if (status === "released") message = "Payment has been released to the agent.";

  const paymentColors = statusColor(paymentStatus);

  return (
    <Card className="border-[#263244] bg-[#172033]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-[#4DA3FF]" />
            <CardTitle>Payment Settlement</CardTitle>
          </div>
          <Badge
            className={cn(
              "rounded-full border capitalize",
              paymentColors.bg,
              paymentColors.text,
              paymentColors.border
            )}
          >
            {statusLabel(paymentStatus)}
          </Badge>
        </div>
        <CardDescription className="text-[#94A3B8]">{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-[#111827] p-4">
          <span className="text-sm text-[#94A3B8]">Escrow Amount</span>
          <span className="text-2xl font-semibold text-[#F8FAFC]">{formatAmount(settlement.amount, settlement.asset)}</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94A3B8]">Recipient</span>
            <AddressDisplay address={settlement.agent.address} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94A3B8]">Release Condition</span>
            <span className="text-[#F8FAFC]">AI review score ≥ 80</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94A3B8]">Current Review</span>
            <span className="text-[#F8FAFC]">
              {settlement.reviewResult ? `${settlement.reviewResult.score}/100` : "Pending"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-[#263244] bg-[#111827]/50 p-3 text-xs text-[#94A3B8]">
          {paymentStatus === "released" ? (
            <>
              <CheckCircle2 className="size-4 shrink-0 text-[#22C55E]" />
              Funds released after passing AI review and client approval.
            </>
          ) : paymentStatus === "ready" ? (
            <>
              <Unlock className="size-4 shrink-0 text-[#4DA3FF]" />
              Payment is unlocked and can be released by the client.
            </>
          ) : paymentStatus === "locked" && status === "needs_revision" ? (
            <>
              <AlertCircle className="size-4 shrink-0 text-[#EF4444]" />
              Payment remains locked until a corrected delivery passes review.
            </>
          ) : (
            <>
              <Lock className="size-4 shrink-0 text-[#F59E0B]" />
              Payment is locked in escrow until acceptance criteria are met.
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
