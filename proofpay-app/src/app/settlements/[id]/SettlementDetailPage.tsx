"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SettlementTimeline } from "@/components/SettlementTimeline";
import { PaymentSettlementCard } from "@/components/PaymentSettlementCard";
import { AgentReputationCard } from "@/components/AgentReputationCard";
import { HashDisplay } from "@/components/HashDisplay";
import { AddressDisplay } from "@/components/AddressDisplay";
import { getSettlement, approveAndRelease } from "@/lib/sui";
import { DEMO_REPUTATION, buildPassingReputation } from "@/lib/demoData";
import { AgentWorkSettlement, AgentReputation } from "@/lib/types";
import { statusLabel, statusColor, formatAmount, formatDate } from "@/lib/format";
import {
  ArrowLeft,
  Upload,
  Bot,
  RotateCcw,
  Unlock,
  ShieldCheck,
  FileText,
  Wallet,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettlementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [settlement, setSettlement] = useState<AgentWorkSettlement | undefined>();
  const [txDigest, setTxDigest] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    setSettlement(getSettlement(id));
  }, [id]);

  if (!settlement) {
    return (
      <>
        <Navbar />
        <main className="flex-1 px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-[#F8FAFC]">Settlement not found</h1>
          <p className="mt-2 text-[#94A3B8]">Check the ID or return to the demo console.</p>
          <Link href="/demo">
            <Button className="mt-6 rounded-xl">Demo Console</Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const colors = statusColor(settlement.status);

  let reputation: AgentReputation = DEMO_REPUTATION;
  if (settlement.status === "released" && settlement.reviewResult) {
    reputation = buildPassingReputation(settlement.reviewResult.score);
  } else if (settlement.reviewResult && settlement.status !== "funded") {
    reputation = {
      agent: settlement.agent,
      completedSettlements: 0,
      latestWorkQualityScore: settlement.reviewResult.score,
      paymentReleased: false,
      passportVerified: false,
    };
  }

  const handleApprove = () => {
    approveAndRelease(settlement.id);
    setTxDigest(`0x${Math.random().toString(16).slice(2, 66).padEnd(64, "0")}`);
    setSettlement(getSettlement(settlement.id));
  };

  const actionButton = () => {
    switch (settlement.status) {
      case "funded":
        return (
          <Link href={`/submit/${settlement.id}`} className="w-full">
            <Button className="w-full rounded-xl">
              <Upload className="mr-2 size-4" />
              Submit Delivery Proof
            </Button>
          </Link>
        );
      case "submitted":
        return (
          <Link href={`/reviewer/${settlement.id}`} className="w-full">
            <Button className="w-full rounded-xl">
              <Bot className="mr-2 size-4" />
              Run AI Review
            </Button>
          </Link>
        );
      case "needs_revision":
        return (
          <Link href={`/submit/${settlement.id}`} className="w-full">
            <Button className="w-full rounded-xl">
              <RotateCcw className="mr-2 size-4" />
              Submit Corrected Delivery
            </Button>
          </Link>
        );
      case "reviewed":
        return (
          <Button className="w-full rounded-xl" onClick={handleApprove}>
            <Unlock className="mr-2 size-4" />
            Approve & Release
          </Button>
        );
      case "released":
        return (
          <Link href="/verify" className="w-full">
            <Button variant="outline" className="w-full rounded-xl border-[#263244]">
              <ShieldCheck className="mr-2 size-4" />
              Verify Passport
            </Button>
          </Link>
        );
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-[#F8FAFC]">{settlement.title}</h1>
                <Badge
                  className={cn(
                    "rounded-full border capitalize",
                    colors.bg,
                    colors.text,
                    colors.border
                  )}
                >
                  {statusLabel(settlement.status)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Settlement <HashDisplay hash={settlement.id} /> · Created {formatDate(settlement.createdAt)}
              </p>
            </div>
            <div className="text-sm text-[#94A3B8]">
              <Clock className="mr-1 inline size-4" />
              Updated {formatDate(settlement.updatedAt)}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <SettlementTimeline settlement={settlement} />
            </div>

            <div className="space-y-5 lg:col-span-2">
              <Card className="border-[#263244] bg-[#172033]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-[#4DA3FF]" />
                    <CardTitle>Settlement Details</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-[#94A3B8]">Client</span>
                    <p>
                      <AddressDisplay address={settlement.client} />
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#94A3B8]">Agent</span>
                    <p className="font-medium text-[#F8FAFC]">{settlement.agent.name}</p>
                    <p>
                      <AddressDisplay address={settlement.agent.address} />
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#94A3B8]">Budget</span>
                    <p className="text-lg font-semibold text-[#F8FAFC]">
                      {formatAmount(settlement.amount, settlement.asset)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#94A3B8]">Acceptance Criteria Hash</span>
                    <p>
                      <HashDisplay hash={settlement.acceptanceCriteriaHash} />
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-5 sm:grid-cols-2">
                <PaymentSettlementCard settlement={settlement} />
                <AgentReputationCard reputation={reputation} />
              </div>

              <Card className="border-[#263244] bg-[#172033]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-[#4DA3FF]" />
                    <CardTitle>Actions</CardTitle>
                  </div>
                  <CardDescription className="text-[#94A3B8]">
                    Available actions depend on the current settlement status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {actionButton()}
                  {txDigest && (
                    <div className="rounded-xl border border-[#263244] bg-[#111827] p-3 text-xs text-[#94A3B8]">
                      <span className="block text-[10px] uppercase tracking-wide">Transaction Digest</span>
                      <HashDisplay hash={txDigest} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
