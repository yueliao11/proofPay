import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TraceBriefPassportCard } from "@/components/TraceBriefPassportCard";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Bot,
  FileCheck,
  Database,
  Zap,
  Scale,
  Fingerprint,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { makeDemoSettlement } from "@/lib/demoData";

const flowSteps = [
  {
    icon: Lock,
    title: "Lock Payment",
    description: "A client funds an escrow with SUI and locks acceptance criteria on-chain.",
  },
  {
    icon: Bot,
    title: "Agent Delivers",
    description: "The AI agent uploads deliverables to Walrus and submits a manifest hash.",
  },
  {
    icon: FileCheck,
    title: "AI Review",
    description: "A deterministic AI reviewer checks the delivery against locked criteria.",
  },
  {
    icon: Database,
    title: "Release & Reputation",
    description: "Payment releases automatically on passing attestation. Reputation updates on-chain.",
  },
];

const whyCards = [
  {
    icon: Zap,
    title: "No More Blind Trust",
    description: "Agents deliver work, but clients need proof. ProofPay ties payment to verifiable outcomes, not promises.",
  },
  {
    icon: Scale,
    title: "Fair Arbitration",
    description: "Locked acceptance criteria become objective rules. The AI reviewer attests pass or fail deterministically.",
  },
  {
    icon: Fingerprint,
    title: "TraceBrief Passport",
    description: "Every settlement mints a verifiable passport linking escrow, deliverable, review, and reputation proofs.",
  },
];

export default function Home() {
  const demoPassportSettlement = makeDemoSettlement();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4DA3FF]/10 via-transparent to-transparent" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#263244] bg-[#172033] px-3 py-1 text-xs font-medium text-[#4DA3FF]">
              <ShieldCheck className="size-3.5" />
              Settlement layer for AI agent work
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[#F8FAFC] sm:text-6xl">
              Pay agents when work is <span className="text-[#4DA3FF]">proven</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#94A3B8]">
              ProofPay turns AI agent deliverables into verifiable payment release conditions using Sui escrow, Walrus data proofs, and AI reviewer attestations.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/create">
                <Button size="lg" className="rounded-xl px-6">
                  Create Settlement
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline" size="lg" className="rounded-xl border-[#263244] px-6">
                  Verify Passport
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Flow diagram cards */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-2xl font-semibold text-[#F8FAFC]">How ProofPay Works</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {flowSteps.map((step, i) => (
                <Card key={step.title} className="border-[#263244] bg-[#172033]">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-[#111827] text-[#4DA3FF]">
                      <step.icon className="size-5" />
                    </div>
                    <CardTitle className="text-base">{i + 1}. {step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-[#94A3B8]">{step.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why agent work needs settlement */}
        <section className="bg-[#111827]/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-2xl font-semibold text-[#F8FAFC]">Why Agent Work Needs Settlement</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {whyCards.map((card) => (
                <Card key={card.title} className="border-[#263244] bg-[#172033]">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#4DA3FF]/20 text-[#8B5CF6]">
                      <card.icon className="size-5" />
                    </div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-[#94A3B8]">{card.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* TraceBrief Passport */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-[#F8FAFC]">TraceBrief Passport</h2>
              <p className="mt-2 text-[#94A3B8]">A single verifiable record tying settlement, delivery, review, and reputation together.</p>
            </div>
            <TraceBriefPassportCard settlement={demoPassportSettlement} />
          </div>
        </section>

        {/* Not another proof tool */}
        <section className="bg-[#111827]/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-center text-2xl font-semibold text-[#F8FAFC]">Not Another Proof Tool</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#263244] bg-[#172033] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#F8FAFC]">
                  <XCircle className="size-5 text-[#EF4444]" />
                  Traditional Escrow
                </h3>
                <ul className="space-y-2 text-sm text-[#94A3B8]">
                  <li>Manual release decisions</li>
                  <li>No verifiable link to deliverables</li>
                  <li>Opaque reputation</li>
                  <li>Arbitrary dispute resolution</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#4DA3FF]/30 bg-[#172033] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#F8FAFC]">
                  <CheckCircle2 className="size-5 text-[#22C55E]" />
                  ProofPay Settlement
                </h3>
                <ul className="space-y-2 text-sm text-[#94A3B8]">
                  <li>AI reviewer attestation drives release</li>
                  <li>Walrus blob + manifest hash on-chain</li>
                  <li>Reputation tied to verified passports</li>
                  <li>Deterministic criteria before delivery</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
