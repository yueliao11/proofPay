"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createSettlement } from "@/lib/sui";
import { DEMO_AGENT, DEMO_CRITERIA } from "@/lib/demoData";
import { Criterion } from "@/lib/types";
import { ArrowLeft, Lock, Eye, Sparkles } from "lucide-react";

const defaultCriteriaText = DEMO_CRITERIA.map((c) => c.text).join("\n");

export default function CreateSettlementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "Sui Overflow Competitor Analysis",
    description:
      "ResearchBot-01 must produce a competitor analysis of Sui Overflow projects, including top trends, winning patterns, and recommendations for builders.",
    agentAddress: DEMO_AGENT.address,
    agentName: DEMO_AGENT.name,
    deliverableType: "Research report (markdown)",
    criteria: defaultCriteriaText,
    budget: "2",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 16),
    reviewerMode: "deterministic",
  });

  const criteriaList: Criterion[] = form.criteria
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, i) => ({
      id: `c${i + 1}`,
      text,
      critical: text.toLowerCase().includes("must") || text.toLowerCase().includes("table") || text.toLowerCase().includes("at least"),
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const settlement = createSettlement({
      client: "0xclienta1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
      agent: { address: form.agentAddress, name: form.agentName },
      amount: Number(form.budget) || 0,
      asset: "SUI",
      title: form.title,
      description: form.description,
      acceptanceCriteria: criteriaList,
      acceptanceCriteriaHash: `0x${Math.random().toString(16).slice(2, 66).padEnd(64, "0")}`,
      status: "funded",
      paymentStatus: "locked",
    });
    router.push(`/settlements/${settlement.id}`);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <h1 className="mb-8 text-2xl font-semibold text-[#F8FAFC]">Create Agent Work Settlement</h1>

          <div className="grid gap-6 lg:grid-cols-3">
            <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
              <Card className="border-[#263244] bg-[#172033]">
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
                  <CardDescription className="text-[#94A3B8]">Define what the agent must deliver.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Sui Overflow Competitor Analysis"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Task Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe the task..."
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#263244] bg-[#172033]">
                <CardHeader>
                  <CardTitle>Agent</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="agentName">Agent Name</Label>
                    <Input
                      id="agentName"
                      value={form.agentName}
                      onChange={(e) => setForm({ ...form, agentName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agentAddress">Agent Address</Label>
                    <Input
                      id="agentAddress"
                      value={form.agentAddress}
                      onChange={(e) => setForm({ ...form, agentAddress: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#263244] bg-[#172033]">
                <CardHeader>
                  <CardTitle>Acceptance Criteria</CardTitle>
                  <CardDescription className="text-[#94A3B8]">One criterion per line.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliverableType">Deliverable Type</Label>
                    <Input
                      id="deliverableType"
                      value={form.deliverableType}
                      onChange={(e) => setForm({ ...form, deliverableType: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="criteria">Criteria</Label>
                    <Textarea
                      id="criteria"
                      value={form.criteria}
                      onChange={(e) => setForm({ ...form, criteria: e.target.value })}
                      rows={8}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#263244] bg-[#172033]">
                <CardHeader>
                  <CardTitle>Settlement Terms</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget in SUI</Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="reviewerMode">Reviewer Mode</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={form.reviewerMode === "deterministic" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setForm({ ...form, reviewerMode: "deterministic" })}
                        className="rounded-xl border-[#263244]"
                      >
                        <Sparkles className="mr-1 size-3.5" />
                        Deterministic AI
                      </Button>
                      <Button
                        type="button"
                        variant={form.reviewerMode === "llm" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setForm({ ...form, reviewerMode: "llm" })}
                        className="rounded-xl border-[#263244]"
                      >
                        <Eye className="mr-1 size-3.5" />
                        LLM Reviewer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full rounded-xl"
              >
                <Lock className="mr-2 size-4" />
                {loading ? "Creating..." : "Create & Lock Payment"}
              </Button>
            </form>

            <aside className="space-y-5">
              <Card className="border-[#263244] bg-[#172033]">
                <CardHeader>
                  <CardTitle>Settlement Preview</CardTitle>
                  <CardDescription className="text-[#94A3B8]">This is what will be locked on-chain.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-xs text-[#94A3B8]">Title</span>
                    <p className="font-medium text-[#F8FAFC]">{form.title || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#94A3B8]">Agent</span>
                    <p className="font-medium text-[#F8FAFC]">{form.agentName || "—"}</p>
                    <p className="break-all font-mono text-xs text-[#94A3B8]">{form.agentAddress}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-[#94A3B8]">Escrow</span>
                    <p className="text-2xl font-semibold text-[#F8FAFC]">{form.budget || "0"} SUI</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-[#94A3B8]">Criteria ({criteriaList.length})</span>
                    <ul className="mt-2 space-y-1.5">
                      {criteriaList.map((c) => (
                        <li key={c.id} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                          <Badge
                            variant="outline"
                            className={
                              c.critical
                                ? "rounded-full border-[#EF4444]/30 text-[#EF4444]"
                                : "rounded-full border-[#4DA3FF]/30 text-[#4DA3FF]"
                            }
                          >
                            {c.critical ? "Critical" : "Optional"}
                          </Badge>
                          <span className="text-[#F8FAFC]">{c.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
