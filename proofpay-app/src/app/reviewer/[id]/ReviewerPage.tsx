"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CriteriaCheckList } from "@/components/CriteriaCheckList";
import { ReviewScore } from "@/components/ReviewScore";
import { WalrusProofCard } from "@/components/WalrusProofCard";
import { HashDisplay } from "@/components/HashDisplay";
import { useSettlementActions } from "@/lib/useSettlementActions";
import { deterministicReview } from "@/lib/reviewer";
import { AgentWorkSettlement, ReviewResult } from "@/lib/types";
import { statusLabel, statusColor } from "@/lib/format";
import { ArrowLeft, Bot, ShieldCheck, Lock, FileText, CheckCircle2, AlertCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewerPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [settlement, setSettlement] = useState<AgentWorkSettlement | undefined>();
  const [review, setReview] = useState<ReviewResult | undefined>();
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { getSettlement, submitReview } = useSettlementActions();

  useEffect(() => {
    if (!id) return;
    getSettlement(id).then((s) => {
      setSettlement(s);
      if (s?.reviewResult) setReview(s.reviewResult);
    });
  }, [id, getSettlement]);

  if (!settlement) {
    return (
      <>
        <Navbar />
        <main className="flex-1 px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-[#F8FAFC]">Settlement not found</h1>
          <Link href="/demo">
            <Button className="mt-6 rounded-xl">Demo Console</Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const colors = statusColor(settlement.status);

  const runReview = async () => {
    if (!settlement.deliveryManifest) return;
    setRunning(true);
    const result = deterministicReview(settlement.acceptanceCriteria, settlement.deliveryManifest);
    result.settlementId = settlement.id;
    result.agent = settlement.agent.name;
    // Simulate review animation time
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setReview(result);
    setRunning(false);
  };

  const handleSubmit = async () => {
    if (!review || !settlement) return;
    setSubmitting(true);
    try {
      await submitReview(settlement, review);
      router.push(`/settlements/${settlement.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const actionLabel = review && review.result === "pass" ? "Approve & Release" : "Attach Attestation";
  const ActionIcon = review && review.result === "pass" ? CheckCircle2 : ShieldCheck;

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/settlements/${id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <ArrowLeft className="size-4" />
            Back to Settlement
          </Link>

          <div className="mb-6 flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#F8FAFC]">AI Reviewer Attestation</h1>
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

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-[#263244] bg-[#172033]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-[#F59E0B]" />
                  <CardTitle>Locked Criteria</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {settlement.acceptanceCriteria.map((c) => (
                    <li key={c.id} className="rounded-xl border border-[#263244] bg-[#111827] p-3 text-sm text-[#F8FAFC]">
                      {c.text}
                      {c.critical && (
                        <Badge
                          variant="outline"
                          className="ml-2 rounded-full border-[#EF4444]/30 text-[#EF4444]"
                        >
                          Critical
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-[#263244] bg-[#172033]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-[#5AC8FA]" />
                  <CardTitle>Agent Delivery Manifest</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {settlement.deliveryManifest ? (
                  <>
                    <WalrusProofCard manifest={settlement.deliveryManifest} />
                    <div className="max-h-48 overflow-auto rounded-xl border border-[#263244] bg-[#111827] p-3 text-xs text-[#94A3B8]">
                      <pre className="whitespace-pre-wrap font-mono">{settlement.deliveryManifest.content}</pre>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#94A3B8]">No delivery manifest submitted yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#263244] bg-[#172033]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bot className="size-4 text-[#8B5CF6]" />
                  <CardTitle>Review Result</CardTitle>
                </div>
                <CardDescription className="text-[#94A3B8]">
                  Deterministic AI review against locked criteria.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {!review ? (
                  <div className="text-center">
                    <p className="mb-4 text-sm text-[#94A3B8]">Run the AI reviewer to evaluate the delivery.</p>
                    <Button
                      onClick={runReview}
                      disabled={running || !settlement.deliveryManifest}
                      className="rounded-xl"
                    >
                      <Bot className="mr-2 size-4" />
                      {running ? "Reviewing..." : "Run AI Review"}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <ReviewScore score={review.score} />
                    </div>

                    <CriteriaCheckList checks={review.checks} animate delay={500} />

                    <div className="space-y-2 rounded-xl border border-[#263244] bg-[#111827] p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Result</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full capitalize",
                            review.result === "pass"
                              ? "border-[#22C55E]/30 text-[#22C55E]"
                              : "border-[#EF4444]/30 text-[#EF4444]"
                          )}
                        >
                          {review.result.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Payment Recommendation</span>
                        <span className={cn(
                          "font-medium",
                          review.paymentRecommendation === "release_payment" ? "text-[#22C55E]" : "text-[#EF4444]"
                        )}>
                          {review.paymentRecommendation.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Attestation</span>
                        <HashDisplay hash={review.attestation.payloadHash} />
                      </div>
                    </div>

                    {review.result === "needs_revision" && (
                      <div className="flex items-start gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm text-[#EF4444]">
                        <AlertCircle className="size-4 shrink-0" />
                        Delivery does not meet all critical criteria. Agent must submit a corrected delivery.
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className={cn(
                        "w-full rounded-xl",
                        review.result === "pass" ? "bg-[#22C55E] hover:bg-[#22C55E]/90" : ""
                      )}
                    >
                      <ActionIcon className="mr-2 size-4" />
                      {submitting ? "Attaching..." : actionLabel}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
