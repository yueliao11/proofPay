"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { WalrusProofCard } from "@/components/WalrusProofCard";
import { getSettlement, submitDelivery } from "@/lib/sui";
import { FAILED_MANIFEST, CORRECTED_MANIFEST, FAILED_DELIVERY_CONTENT, CORRECTED_DELIVERY_CONTENT } from "@/lib/demoData";
import { AgentWorkSettlement, DeliveryManifest } from "@/lib/types";
import { statusLabel, statusColor } from "@/lib/format";
import { ArrowLeft, Upload, FileX, FileCheck, Lock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubmitDeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [settlement, setSettlement] = useState<AgentWorkSettlement | undefined>();
  const [manifest, setManifest] = useState<DeliveryManifest>(CORRECTED_MANIFEST);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const s = getSettlement(id);
    setSettlement(s);
    if (s?.status === "needs_revision") {
      setManifest(CORRECTED_MANIFEST);
    }
  }, [id]);

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

  const updateFromContent = (content: string) => {
    const isCorrected = content.includes("Comparison Table");
    setManifest({
      ...(isCorrected ? CORRECTED_MANIFEST : FAILED_MANIFEST),
      content,
      summary: isCorrected ? "Includes comparison table and recommendations" : "Missing comparison table",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    submitDelivery(settlement.id, manifest);
    router.push(`/settlements/${settlement.id}`);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/settlements/${id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <ArrowLeft className="size-4" />
            Back to Settlement
          </Link>

          <div className="mb-6 flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#F8FAFC]">Submit Delivery Proof</h1>
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

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-[#263244] bg-[#172033]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-[#F59E0B]" />
                  <CardTitle>Locked Acceptance Criteria</CardTitle>
                </div>
                <CardDescription className="text-[#94A3B8]">
                  These criteria were hashed at settlement creation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {settlement.acceptanceCriteria.map((c) => (
                    <li key={c.id} className="flex items-start gap-2 rounded-xl border border-[#263244] bg-[#111827] p-3">
                      <Shield className="mt-0.5 size-4 shrink-0 text-[#4DA3FF]" />
                      <div>
                        <p className="text-sm text-[#F8FAFC]">{c.text}</p>
                        {c.critical && (
                          <Badge
                            variant="outline"
                            className="mt-1 rounded-full border-[#EF4444]/30 text-[#EF4444]"
                          >
                            Critical
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Card className="border-[#263244] bg-[#172033]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="size-4 text-[#4DA3FF]" />
                      <CardTitle>Delivery Proof</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateFromContent(FAILED_DELIVERY_CONTENT)}
                        className="rounded-xl border-[#263244]"
                      >
                        <FileX className="mr-1 size-3.5 text-[#EF4444]" />
                        Use Failed Demo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateFromContent(CORRECTED_DELIVERY_CONTENT)}
                        className="rounded-xl border-[#263244]"
                      >
                        <FileCheck className="mr-1 size-3.5 text-[#22C55E]" />
                        Use Corrected Demo
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-[#94A3B8]">
                    Paste deliverable content or load a demo manifest.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fileName">File Name</Label>
                    <Input
                      id="fileName"
                      value={manifest.fileName}
                      onChange={(e) => setManifest({ ...manifest, fileName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Input
                      id="summary"
                      value={manifest.summary}
                      onChange={(e) => setManifest({ ...manifest, summary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Deliverable Content</Label>
                    <Textarea
                      id="content"
                      value={manifest.content}
                      onChange={(e) => updateFromContent(e.target.value)}
                      rows={12}
                    />
                  </div>
                </CardContent>
              </Card>

              <WalrusProofCard manifest={manifest} />

              <Button type="submit" size="lg" disabled={submitting} className="w-full rounded-xl">
                <Upload className="mr-2 size-4" />
                {submitting ? "Submitting..." : "Submit Delivery Proof"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
