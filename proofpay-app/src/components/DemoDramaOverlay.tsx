"use client";

import { useEffect, useState } from "react";
import { XCircle, CheckCircle2, PartyPopper, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const scenes: Record<number, { icon: React.ReactNode; title: string; subtitle: string; tone: "bad" | "good" | "gold" | "blue" }> = {
  3: {
    icon: <XCircle className="size-10" />,
    title: "Quality Gate Failed",
    subtitle: "Payment is frozen. The agent must fix the delivery.",
    tone: "bad",
  },
  5: {
    icon: <CheckCircle2 className="size-10" />,
    title: "Quality Gate Passed",
    subtitle: "AI attestation unlocked the escrow for release.",
    tone: "good",
  },
  6: {
    icon: <PartyPopper className="size-10" />,
    title: "Funds Released",
    subtitle: "2 SUI sent to the agent — no manual invoice chase.",
    tone: "gold",
  },
  7: {
    icon: <ShieldCheck className="size-10" />,
    title: "Passport Verified",
    subtitle: "Immutable work record now lives on Sui Testnet.",
    tone: "blue",
  },
};

const toneStyles: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
  bad: { bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/40", text: "text-[#EF4444]", shadow: "shadow-[#EF4444]/20" },
  good: { bg: "bg-[#22C55E]/10", border: "border-[#22C55E]/40", text: "text-[#22C55E]", shadow: "shadow-[#22C55E]/20" },
  gold: { bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/40", text: "text-[#F59E0B]", shadow: "shadow-[#F59E0B]/20" },
  blue: { bg: "bg-[#4DA3FF]/10", border: "border-[#4DA3FF]/40", text: "text-[#4DA3FF]", shadow: "shadow-[#4DA3FF]/20" },
};

export function DemoDramaOverlay({ currentStep }: { currentStep: number }) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    if (scenes[currentStep] && step !== currentStep) {
      setStep(currentStep);
      setShow(true);
      const t = setTimeout(() => setShow(false), 2200);
      return () => clearTimeout(t);
    }
  }, [currentStep, step]);

  if (!step || !scenes[step]) return null;
  const scene = scenes[step];
  const style = toneStyles[scene.tone];

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#0B1020]/80 backdrop-blur-sm transition-opacity duration-500",
        show ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "mx-4 flex max-w-md flex-col items-center gap-4 rounded-3xl border-2 p-8 text-center shadow-2xl transition-all duration-500",
          style.bg,
          style.border,
          style.shadow,
          show ? "scale-100" : "scale-90"
        )}
      >
        <div className={cn("rounded-full bg-[#0B1020]/60 p-4", style.text)}>{scene.icon}</div>
        <h2 className={cn("text-3xl font-bold", style.text)}>{scene.title}</h2>
        <p className="text-lg text-[#F8FAFC]">{scene.subtitle}</p>
      </div>
    </div>
  );
}
