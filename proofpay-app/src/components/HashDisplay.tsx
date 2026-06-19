"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HashDisplay({
  hash,
  start = 6,
  end = 4,
  className,
}: {
  hash: string;
  start?: number;
  end?: number;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const truncated = hash.length <= start + end + 2 ? hash : `${hash.slice(0, start + 2)}...${hash.slice(-end)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs", className)}>
      <span className="text-[#94A3B8]">{truncated}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="size-5 text-[#94A3B8] hover:text-[#F8FAFC]"
        onClick={copy}
        aria-label="Copy hash"
      >
        {copied ? <Check className="size-3 text-[#22C55E]" /> : <Copy className="size-3" />}
      </Button>
    </span>
  );
}
