"use client";

import { DeliveryManifest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HashDisplay } from "./HashDisplay";
import { Database, FileType2, FileText, ScrollText } from "lucide-react";

export function WalrusProofCard({ manifest }: { manifest: DeliveryManifest }) {
  return (
    <Card className="border-[#263244] bg-[#172033]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="size-4 text-[#5AC8FA]" />
          <CardTitle>Walrus Proof</CardTitle>
        </div>
        <CardDescription className="text-[#94A3B8]">Decentralized storage attestation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-[#263244] bg-[#111827] p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-[#4DA3FF]">
            <FileType2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 text-[#94A3B8]" />
              <span className="truncate text-sm font-medium text-[#F8FAFC]">{manifest.fileName}</span>
            </div>
            <div className="mt-1 text-xs text-[#94A3B8]">{manifest.contentType}</div>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#94A3B8]">Blob ID</span>
            <HashDisplay hash={manifest.blobId} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#94A3B8]">Manifest Hash</span>
            <HashDisplay hash={manifest.manifestHash} />
          </div>
        </div>

        {manifest.summary && (
          <div className="flex items-start gap-2 rounded-xl border border-[#263244] bg-[#111827]/50 p-3 text-sm text-[#94A3B8]">
            <ScrollText className="mt-0.5 size-4 shrink-0 text-[#8B5CF6]" />
            {manifest.summary}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
