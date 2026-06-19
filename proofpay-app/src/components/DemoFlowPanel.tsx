"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DemoRole, AgentWorkSettlement } from "@/lib/types";
import { cn } from "@/lib/utils";

const steps: { id: number; label: string; role: DemoRole }[] = [
  { id: 1, label: "Create Demo Settlement", role: "client" },
  { id: 2, label: "Submit Failed Delivery", role: "agent" },
  { id: 3, label: "Run Failed Review", role: "reviewer" },
  { id: 4, label: "Submit Corrected Delivery", role: "agent" },
  { id: 5, label: "Run Passing Review", role: "reviewer" },
  { id: 6, label: "Approve & Release", role: "client" },
  { id: 7, label: "Verify Passport", role: "judge" },
];

export function DemoFlowPanel({
  activeRole,
  currentStep,
  settlement,
  walletConnected,
  onStep,
}: {
  activeRole: DemoRole;
  currentStep: number;
  settlement?: AgentWorkSettlement;
  walletConnected: boolean;
  onStep: (step: number) => void;
}) {
  return (
    <Card className="border-[#263244] bg-[#172033]">
      <CardHeader>
        <CardTitle>Demo Flow</CardTitle>
        <CardDescription className="text-[#94A3B8]">
          Step through the full ProofPay lifecycle as {activeRole === "client" ? "the client" : activeRole === "agent" ? "the agent" : activeRole === "reviewer" ? "the AI reviewer" : "the judge"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!walletConnected && (
          <div className="rounded-xl border border-dashed border-[#4DA3FF]/40 bg-[#4DA3FF]/5 p-4 text-center text-sm text-[#94A3B8]">
            Connect the demo wallet above to start the on-chain lifecycle.
          </div>
        )}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => {
            const isActive = step.id === currentStep + 1;
            const isDone = step.id <= currentStep;
            const roleMatch = step.role === activeRole;
            return (
              <Button
                key={step.id}
                type="button"
                variant={isDone ? "secondary" : isActive ? "default" : "outline"}
                className={cn(
                  "justify-start gap-2 rounded-xl border-[#263244] text-left",
                  isActive && "ring-2 ring-[#4DA3FF]/50",
                  !roleMatch && !isActive && "opacity-60"
                )}
                disabled={!walletConnected || step.id > currentStep + 1}
                onClick={() => onStep(step.id)}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    isDone
                      ? "bg-[#22C55E] text-white"
                      : isActive
                      ? "bg-[#0B1020] text-[#4DA3FF]"
                      : "bg-[#263244] text-[#94A3B8]"
                  )}
                >
                  {step.id}
                </span>
                <span className="text-xs">{step.label}</span>
              </Button>
            );
          })}
        </div>

        {settlement && (
          <div className="rounded-xl border border-[#263244] bg-[#111827] p-4">
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <span className="text-xs text-[#94A3B8]">Status</span>
                <p className="font-medium capitalize text-[#F8FAFC]">{settlement.status.replace(/_/g, " ")}</p>
              </div>
              <div>
                <span className="text-xs text-[#94A3B8]">Payment</span>
                <p className="font-medium capitalize text-[#F8FAFC]">{settlement.paymentStatus}</p>
              </div>
              <div>
                <span className="text-xs text-[#94A3B8]">Score</span>
                <p className="font-medium text-[#F8FAFC]">{settlement.reviewResult?.score ?? "—"}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
