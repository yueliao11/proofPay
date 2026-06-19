"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { DemoFlowPanel } from "@/components/DemoFlowPanel";
import { SettlementTimeline } from "@/components/SettlementTimeline";
import { PaymentSettlementCard } from "@/components/PaymentSettlementCard";
import { AgentReputationCard } from "@/components/AgentReputationCard";
import { TraceBriefPassportCard } from "@/components/TraceBriefPassportCard";
import { HashDisplay } from "@/components/HashDisplay";
import { AddressDisplay } from "@/components/AddressDisplay";
import {
  resetDemo,
  getSettlement,
  submitDelivery,
  submitReview,
  approveAndRelease,
  DEMO_ID,
} from "@/lib/sui";
import {
  FAILED_MANIFEST,
  CORRECTED_MANIFEST,
  DEMO_REPUTATION,
  buildPassingReputation,
} from "@/lib/demoData";
import { deterministicReview } from "@/lib/reviewer";
import { AgentWorkSettlement, DemoRole, AgentReputation } from "@/lib/types";
import { statusLabel, statusColor, formatAmount, formatDate } from "@/lib/format";
import { RefreshCcw, ShieldCheck, ArrowRight, Bot, FileCheck, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeploymentBanner } from "@/components/DeploymentBanner";
import { DemoWalletPanel, useDemoWallet } from "@/components/DemoWalletPanel";
import { DemoDramaOverlay } from "@/components/DemoDramaOverlay";
import { Confetti } from "@/components/Confetti";

function makeTxDigest(): string {
  return `0x${Math.random().toString(16).slice(2, 66).padEnd(64, "0")}`;
}

function stepFromStatus(s: AgentWorkSettlement): number {
  switch (s.status) {
    case "funded":
      return s.deliveryManifest ? 2 : 1;
    case "submitted":
      return 3;
    case "needs_revision":
      return 4;
    case "reviewed":
      return 6;
    case "released":
      return 7;
    default:
      return 0;
  }
}

export default function DemoPage() {
  const [activeRole, setActiveRole] = useState<DemoRole>("client");
  const [currentStep, setCurrentStep] = useState(0);
  const [settlement, setSettlement] = useState<AgentWorkSettlement | undefined>();
  const [txDigest, setTxDigest] = useState<string>("");
  const [logs, setLogs] = useState<string[]>(["Demo console ready. Select a role and begin the flow."]);
  const [celebrate, setCelebrate] = useState(false);
  const demoWallet = useDemoWallet();
  const connected = demoWallet.connected;

  useEffect(() => {
    const s = getSettlement(DEMO_ID);
    if (s) {
      setSettlement(s);
      setCurrentStep(stepFromStatus(s));
    }
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-5), msg]);
  };

  const runStep = async (step: number) => {
    if (!settlement && step !== 1) return;
    let s = settlement;
    switch (step) {
      case 1:
        s = resetDemo();
        setSettlement(s);
        setCurrentStep(1);
        setTxDigest(makeTxDigest());
        addLog(`Created demo settlement ${s.id.slice(0, 10)}...`);
        setActiveRole("agent");
        break;
      case 2:
        s = submitDelivery(s!.id, FAILED_MANIFEST);
        setSettlement(s);
        setCurrentStep(2);
        setTxDigest(makeTxDigest());
        addLog("Submitted failed delivery manifest.");
        setActiveRole("reviewer");
        break;
      case 3:
        const failedReview = deterministicReview(s!.acceptanceCriteria, FAILED_MANIFEST);
        failedReview.settlementId = s!.id;
        failedReview.agent = s!.agent.name;
        s = submitReview(s!.id, failedReview);
        setSettlement(s);
        setCurrentStep(3);
        setTxDigest(makeTxDigest());
        addLog(`AI review failed with score ${failedReview.score}. Payment remains locked.`);
        setActiveRole("agent");
        break;
      case 4:
        s = submitDelivery(s!.id, CORRECTED_MANIFEST);
        setSettlement(s);
        setCurrentStep(4);
        setTxDigest(makeTxDigest());
        addLog("Submitted corrected delivery manifest.");
        setActiveRole("reviewer");
        break;
      case 5:
        const passingReview = deterministicReview(s!.acceptanceCriteria, CORRECTED_MANIFEST);
        passingReview.settlementId = s!.id;
        passingReview.agent = s!.agent.name;
        s = submitReview(s!.id, passingReview);
        setSettlement(s);
        setCurrentStep(5);
        setTxDigest(makeTxDigest());
        addLog(`AI review passed with score ${passingReview.score}. Payment ready to release.`);
        setActiveRole("client");
        break;
      case 6:
        s = approveAndRelease(s!.id);
        setSettlement(s);
        setCurrentStep(6);
        setTxDigest(makeTxDigest());
        setCelebrate(true);
        addLog("Payment released and reputation updated.");
        setActiveRole("judge");
        break;
      case 7:
        setCurrentStep(7);
        addLog("Passport verified. Settlement complete.");
        break;
    }
  };

  const reputation: AgentReputation =
    settlement?.status === "released" && settlement.reviewResult
      ? buildPassingReputation(settlement.reviewResult.score)
      : DEMO_REPUTATION;

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#F8FAFC]">Demo Console</h1>
              <p className="text-sm text-[#94A3B8]">Walk through the full ProofPay lifecycle.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const s = resetDemo();
                setSettlement(s);
                setCurrentStep(0);
                setTxDigest("");
                setLogs(["Demo reset."])
              }}
              className="rounded-xl border-[#263244]"
            >
              <RefreshCcw className="mr-2 size-4" />
              Reset Demo
            </Button>
          </div>

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <RoleSwitcher active={activeRole} onChange={setActiveRole} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <DeploymentBanner />
              <DemoWalletPanel
                connected={connected}
                onConnect={demoWallet.connect}
                onDisconnect={demoWallet.disconnect}
              />
            </div>
          </div>

          <DemoFlowPanel
            activeRole={activeRole}
            currentStep={currentStep}
            settlement={settlement}
            walletConnected={connected}
            onStep={runStep}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-1">
              {settlement ? (
                <SettlementTimeline settlement={settlement} />
              ) : (
                <Card className="border-[#263244] bg-[#172033]">
                  <CardContent className="py-8 text-center text-sm text-[#94A3B8]">
                    No demo settlement yet. Click <strong>Create Demo Settlement</strong> to begin.
                  </CardContent>
                </Card>
              )}

              <Card className="border-[#263244] bg-[#172033]">
                <CardHeader>
                  <CardTitle className="text-sm">Event Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-[#94A3B8]">
                    {logs.map((log, i) => (
                      <li key={i} className="border-l-2 border-[#4DA3FF] pl-2">
                        {log}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5 lg:col-span-2">
              {settlement && (
                <>
                  <Card className="border-[#263244] bg-[#172033]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className="size-4 text-[#4DA3FF]" />
                          <CardTitle>{settlement.title}</CardTitle>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-full border capitalize",
                            statusColor(settlement.status).bg,
                            statusColor(settlement.status).text,
                            statusColor(settlement.status).border
                          )}
                        >
                          {statusLabel(settlement.status)}
                        </Badge>
                      </div>
                      <CardDescription className="text-[#94A3B8]">
                        Settlement <HashDisplay hash={settlement.id} /> · {formatDate(settlement.updatedAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <span className="text-xs text-[#94A3B8]">Client</span>
                        <p><AddressDisplay address={settlement.client} /></p>
                      </div>
                      <div>
                        <span className="text-xs text-[#94A3B8]">Agent</span>
                        <p className="font-medium text-[#F8FAFC]">{settlement.agent.name}</p>
                        <p><AddressDisplay address={settlement.agent.address} /></p>
                      </div>
                      <div>
                        <span className="text-xs text-[#94A3B8]">Escrow</span>
                        <p className="text-lg font-semibold text-[#F8FAFC]">{formatAmount(settlement.amount, settlement.asset)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-[#94A3B8]">Payment Status</span>
                        <p className="font-medium capitalize text-[#F8FAFC]">{settlement.paymentStatus}</p>
                      </div>
                      {txDigest && (
                        <div className="sm:col-span-2">
                          <span className="text-xs text-[#94A3B8]">Latest Transaction Digest</span>
                          <p><HashDisplay hash={txDigest} /></p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <PaymentSettlementCard settlement={settlement} />
                    <AgentReputationCard reputation={reputation} />
                  </div>

                  {currentStep === 7 && (
                    <TraceBriefPassportCard settlement={settlement} />
                  )}

                  <div className="flex flex-wrap gap-3">
                    {currentStep === 7 && (
                      <Link href="/verify">
                        <Button variant="outline" className="rounded-xl border-[#263244]">
                          <ShieldCheck className="mr-2 size-4" />
                          Open Passport Verifier
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </Link>
                    )}
                    {settlement.status === "reviewed" && (
                      <Button onClick={() => runStep(6)} className="rounded-xl bg-[#22C55E] hover:bg-[#22C55E]/90">
                        <Unlock className="mr-2 size-4" />
                        Approve & Release
                      </Button>
                    )}
                    {(settlement.status === "funded" || settlement.status === "needs_revision") && (
                      <Link href={`/submit/${settlement.id}`}>
                        <Button variant="outline" className="rounded-xl border-[#263244]">
                          Submit Delivery Proof
                        </Button>
                      </Link>
                    )}
                    {settlement.status === "submitted" && (
                      <Link href={`/reviewer/${settlement.id}`}>
                        <Button variant="outline" className="rounded-xl border-[#263244]">
                          <Bot className="mr-2 size-4" />
                          Open Reviewer
                        </Button>
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <DemoDramaOverlay currentStep={currentStep} />
      <Confetti active={celebrate} />
      <Footer />
    </>
  );
}
