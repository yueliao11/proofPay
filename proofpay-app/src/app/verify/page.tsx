"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TraceBriefPassportCard } from "@/components/TraceBriefPassportCard";
import { getSettlement, buildPassport, resetDemo, DEMO_ID } from "@/lib/sui";
import { TraceBriefPassport } from "@/lib/types";
import { ShieldCheck, Search, Bot, AlertCircle } from "lucide-react";

export default function VerifyPage() {
  const [id, setId] = useState("");
  const [passport, setPassport] = useState<TraceBriefPassport | undefined>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setError("");
    setPassport(undefined);
    if (!id.trim()) {
      setError("Enter a settlement ID.");
      return;
    }
    setLoading(true);
    const settlement = getSettlement(id.trim());
    if (!settlement) {
      setError("Settlement not found.");
    } else {
      setPassport(buildPassport(settlement));
    }
    setLoading(false);
  };

  const handleDemo = () => {
    setLoading(true);
    setError("");
    const demo = getSettlement(DEMO_ID) || resetDemo();
    setPassport(buildPassport(demo));
    setId(demo.id);
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5AC8FA] to-[#4DA3FF]">
              <ShieldCheck className="size-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-[#F8FAFC]">Verify TraceBrief Passport</h1>
            <p className="mt-2 text-[#94A3B8]">Enter a settlement ID to inspect its verifiable work record.</p>
          </div>

          <Card className="border-[#263244] bg-[#172033]">
            <CardHeader>
              <CardTitle>Passport Lookup</CardTitle>
              <CardDescription className="text-[#94A3B8]">
                Settlement IDs are 0x-prefixed hashes stored in local state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="settlementId">Settlement ID</Label>
                  <Input
                    id="settlementId"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="0x..."
                    className="font-mono"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={handleVerify}
                    disabled={loading}
                    className="rounded-xl"
                  >
                    <Search className="mr-2 size-4" />
                    Verify Passport
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDemo}
                    disabled={loading}
                    className="rounded-xl border-[#263244]"
                  >
                    <Bot className="mr-2 size-4" />
                    View ResearchBot-01 Passport
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm text-[#EF4444]">
                  <AlertCircle className="size-4" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {passport && (
            <div className="mt-6">
              <TraceBriefPassportCard passport={passport} />
              <div className="mt-4 text-center">
                <Link href={`/settlements/${passport.settlementId}`}>
                  <Button variant="outline" className="rounded-xl border-[#263244]">
                    View Settlement
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
