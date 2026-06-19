"use client";

import { AgentWorkSettlement, TraceBriefPassport } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HashDisplay } from "./HashDisplay";
import { AddressDisplay } from "./AddressDisplay";
import { formatAmount, formatDate } from "@/lib/format";
import { FileText, Shield, Bot, Star, Link2 } from "lucide-react";
import { buildPassport } from "@/lib/sui";

export function TraceBriefPassportCard({
  passport: propPassport,
  settlement: propSettlement,
}: {
  passport?: TraceBriefPassport;
  settlement?: AgentWorkSettlement;
}) {
  const passport = propPassport || (propSettlement ? buildPassport(propSettlement) : undefined);
  if (!passport) return null;

  const evidence = [
    { label: "Settlement Created", hash: passport.settlementId, icon: FileText },
    { label: "Acceptance Criteria", hash: passport.acceptanceCriteriaHash, icon: Shield },
    { label: "Deliverable Manifest", hash: passport.deliverableManifestHash || "—", icon: FileText },
    { label: "Deliverable Blob", hash: passport.deliverableBlobId || "—", icon: Link2 },
    { label: "Review Attestation", hash: passport.reviewerAttestation?.payloadHash || "—", icon: Bot },
    { label: "Review Report", hash: passport.reviewReportBlobId || "—", icon: FileText },
  ];

  return (
    <Card className="border-[#263244] bg-[#172033]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-[#5AC8FA]" />
          <CardTitle>TraceBrief Passport</CardTitle>
        </div>
        <CardDescription className="text-[#94A3B8]">Verifiable record of agent work settlement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Section icon={FileText} title="Settlement">
            <Row label="Passport ID" value={<HashDisplay hash={passport.id} />} />
            <Row label="Settlement" value={<HashDisplay hash={passport.settlementId} />} />
            <Row label="Escrow" value={`${formatAmount(passport.escrowAmount, "SUI")}`} />
            <Row label="Payment" value={<span className="capitalize text-[#F8FAFC]">{passport.paymentStatus}</span>} />
            <Row label="Created" value={formatDate(passport.createdAt)} />
            <Row label="Updated" value={formatDate(passport.updatedAt)} />
          </Section>

          <Section icon={FileText} title="Delivery Proof">
            <Row label="Blob ID" value={<HashDisplay hash={passport.deliverableBlobId || "—"} />} />
            <Row label="Manifest Hash" value={<HashDisplay hash={passport.deliverableManifestHash || "—"} />} />
          </Section>

          <Section icon={Bot} title="AI Review">
            <Row label="Score" value={passport.reviewScore ?? "Pending"} />
            <Row label="Attestation" value={<HashDisplay hash={passport.reviewerAttestation?.payloadHash || "—"} />} />
            <Row label="Report Blob" value={<HashDisplay hash={passport.reviewReportBlobId || "—"} />} />
          </Section>

          <Section icon={Star} title="Agent Reputation">
            <Row label="Agent" value={passport.agent.name} />
            <Row label="Address" value={<AddressDisplay address={passport.agent.address} />} />
          </Section>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#F8FAFC]">Evidence Chain</h4>
          <div className="space-y-2">
            {evidence.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-[#263244] bg-[#111827] px-3 py-2"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#172033] text-[#4DA3FF]">
                  <item.icon className="size-3" />
                </div>
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-[#94A3B8]">{item.label}</span>
                  <HashDisplay hash={item.hash} className="mt-0.5 sm:mt-0" />
                </div>
                {index < evidence.length - 1 && (
                  <div className="hidden h-4 w-px bg-[#263244] sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#263244] bg-[#111827] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-[#4DA3FF]" />
        <h4 className="text-sm font-semibold text-[#F8FAFC]">{title}</h4>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-[#94A3B8]">{label}</span>
      <span className="text-sm text-[#F8FAFC]">{value}</span>
    </div>
  );
}
