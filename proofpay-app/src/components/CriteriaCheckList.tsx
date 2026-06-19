"use client";

import { useEffect, useState } from "react";
import { ReviewCheck, Criterion } from "@/lib/types";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type CriteriaCheckItem = {
  criterion: string;
  status: "checking" | "pass" | "fail";
  reason?: string;
};

export function CriteriaCheckList({
  checks,
  animate = true,
  delay = 600,
}: {
  checks: CriteriaCheckItem[] | ReviewCheck[] | Criterion[];
  animate?: boolean;
  delay?: number;
}) {
  const [visibleIndex, setVisibleIndex] = useState(animate ? -1 : checks.length - 1);

  useEffect(() => {
    if (!animate) return;
    setVisibleIndex(-1);
    let i = 0;
    const timer = setInterval(() => {
      setVisibleIndex(i);
      i += 1;
      if (i >= checks.length) clearInterval(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [checks, animate, delay]);

  const normalized: CriteriaCheckItem[] = checks.map((c) => {
    if ("status" in c && typeof c.status === "string") {
      if (c.status === "checking" || c.status === "pass" || c.status === "fail") {
        return c as CriteriaCheckItem;
      }
      return {
        criterion: (c as ReviewCheck).criterion,
        status: (c as ReviewCheck).status === "pass" ? "pass" : "fail",
        reason: (c as ReviewCheck).reason,
      };
    }
    return { criterion: (c as Criterion).text, status: "checking" };
  });

  const progress = normalized.filter((c) => c.status !== "checking").length;
  const percentage = normalized.length ? Math.round((progress / normalized.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#94A3B8]">Progress</span>
        <span className="font-medium text-[#F8FAFC]">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#111827]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4DA3FF] to-[#8B5CF6] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <ul className="space-y-2">
        {normalized.map((check, index) => {
          const isVisible = index <= visibleIndex || !animate;
          return (
            <li
              key={index}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-[#263244] bg-[#111827] p-3 transition-all duration-300",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  check.status === "pass" && "bg-[#22C55E]/10 text-[#22C55E]",
                  check.status === "fail" && "bg-[#EF4444]/10 text-[#EF4444]",
                  check.status === "checking" && "bg-[#4DA3FF]/10 text-[#4DA3FF]"
                )}
              >
                {check.status === "pass" ? (
                  <Check className="size-3" />
                ) : check.status === "fail" ? (
                  <X className="size-3" />
                ) : (
                  <Loader2 className="size-3 animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#F8FAFC]">{check.criterion}</p>
                {check.reason && isVisible && (
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      check.status === "fail" ? "text-[#EF4444]" : "text-[#94A3B8]"
                    )}
                  >
                    {check.reason}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
